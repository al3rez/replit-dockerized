from fabric import Connection, task
import os
import json
import subprocess
import time
from pathlib import Path
from dotenv import load_dotenv
import yaml

# Load environment variables
load_dotenv()

# Load configuration from deploy.yaml
with open('deploy.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Configuration
SERVER_NAME = config['server']['name']
SERVER_TYPE = config['server']['type']
SERVER_IMAGE = config['server']['image']
SERVER_LOCATION = config['server']['location']
DOCKER_USERNAME = config['docker']['username']
DOCKER_PASSWORD = os.getenv("DOCKER_PASSWORD")  # Still get password from env for security
IMAGE_NAME = config['docker']['image_name']
FULL_IMAGE_NAME = f"{DOCKER_USERNAME}/{IMAGE_NAME}"
DOMAIN = config['domain']
SSH_KEY_NAME = config['ssh']['key_name']

def check_hcloud():
    """Check if hcloud CLI is installed"""
    try:
        subprocess.run(["hcloud", "-h"], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        raise SystemExit("Error: hcloud CLI is not installed. Please install it first.")

def check_ssh_agent():
    """Check if SSH agent is running and has keys"""
    if not os.environ.get("SSH_AUTH_SOCK"):
        print("Starting SSH agent...")
        subprocess.run(["ssh-agent", "-s"], check=True)
    
    result = subprocess.run(["ssh-add", "-l"], capture_output=True)
    if result.returncode != 0:
        print("Adding key...")
        subprocess.run(["ssh-add", os.path.expanduser(f"~/.ssh/{SSH_KEY_NAME}")], check=True)

def check_docker_rollout():
    """Check if docker-rollout is installed"""
    rollout_path = os.path.expanduser("~/.docker/cli-plugins/docker-rollout")
    if not os.path.exists(rollout_path):
        print("Installing docker-rollout...")
        os.makedirs(os.path.dirname(rollout_path), exist_ok=True)
        subprocess.run([
            "curl", "-L", 
            "https://github.com/wowu/docker-rollout/releases/latest/download/docker-rollout",
            "-o", rollout_path
        ], check=True)
        os.chmod(rollout_path, 0o755)

def get_ssh_key():
    """Get the SSH key from Hetzner"""
    result = subprocess.run(["hcloud", "ssh-key", "list", "-o", "json"], capture_output=True, text=True)
    ssh_keys = json.loads(result.stdout)
    
    if not ssh_keys:
        raise SystemExit("No SSH keys found in Hetzner. Please create one first.")
    
    for key in ssh_keys:
        if key["name"] == SSH_KEY_NAME:
            return key["name"]
    
    raise SystemExit(f"SSH key '{SSH_KEY_NAME}' not found in Hetzner.")

def create_server(ssh_key_name):
    """Create server if it doesn't exist"""
    try:
        subprocess.run(["hcloud", "server", "describe", SERVER_NAME], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Creating server...")
        subprocess.run([
            "hcloud", "server", "create",
            "--name", SERVER_NAME,
            "--type", SERVER_TYPE,
            "--image", SERVER_IMAGE,
            "--location", SERVER_LOCATION,
            "--ssh-key", ssh_key_name
        ], check=True)

def get_server_ip():
    """Get server IP address"""
    result = subprocess.run(
        ["hcloud", "server", "describe", SERVER_NAME, "-o", "json"],
        capture_output=True, text=True
    )
    server_info = json.loads(result.stdout)
    return server_info["public_net"]["ipv4"]["ip"]

def wait_for_server(ip):
    """Wait for server to be ready"""
    print("Waiting for server to be ready...")
    while True:
        try:
            subprocess.run([
                "ssh", "-i", os.path.expanduser(f"~/.ssh/{SSH_KEY_NAME}"),
                "-o", "StrictHostKeyChecking=no",
                "-o", "BatchMode=yes",
                f"root@{ip}",
                "echo 'Server is ready'"
            ], check=True, capture_output=True)
            break
        except subprocess.CalledProcessError:
            time.sleep(5)

def build_and_push_docker():
    """Build and push Docker image"""
    print("Building and pushing Docker image...")
    subprocess.run(["docker", "build", "-t", f"{FULL_IMAGE_NAME}:latest", "."], check=True)
    subprocess.run(["docker", "push", f"{FULL_IMAGE_NAME}:latest"], check=True)

def setup_server(conn):
    """Setup server (first time only)"""
    print("Setting up server...")
    
    # Suppress welcome message
    conn.run("touch ~/.hushlogin")
    
    # Install Docker if not installed
    if conn.run("command -v docker", warn=True).exited != 0:
        conn.run("apt-get update")
        conn.run("apt-get install -y apt-transport-https ca-certificates curl software-properties-common")
        conn.run("curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -")
        conn.run(f"add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\"")
        conn.run("apt-get update")
        conn.run("apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin")
    
    # Install docker-rollout if not installed
    if not conn.run("test -f ~/.docker/cli-plugins/docker-rollout", warn=True).ok:
        conn.run("mkdir -p ~/.docker/cli-plugins")
        conn.run("curl -L https://github.com/wowu/docker-rollout/releases/latest/download/docker-rollout -o ~/.docker/cli-plugins/docker-rollout")
        conn.run("chmod +x ~/.docker/cli-plugins/docker-rollout")
    
    # Create directory for the application
    conn.run(f"mkdir -p /root/{IMAGE_NAME}")

@task
def deploy(c):
    """Deploy the application"""
    # Check prerequisites
    check_hcloud()
    check_ssh_agent()
    check_docker_rollout()
    
    # Get SSH key
    ssh_key_name = get_ssh_key()
    print(f"Using SSH key: {ssh_key_name}")
    
    # Create server if needed
    create_server(ssh_key_name)
    
    # Get server IP and wait for it to be ready
    server_ip = get_server_ip()
    print(f"Server IP: {server_ip}")
    wait_for_server(server_ip)
    
    # Build and push Docker image
    build_and_push_docker()
    
    # Connect to server
    conn = Connection(f"root@{server_ip}", connect_kwargs={"key_filename": os.path.expanduser(f"~/.ssh/{SSH_KEY_NAME}")})
    
    # Setup server
    setup_server(conn)
    
    # Copy files to server
    print("Copying docker-compose.prod.yaml to server...")
    conn.put("docker-compose.prod.yaml", f"/root/{IMAGE_NAME}/docker-compose.yaml")
    
    print("Copying .env file to server...")
    conn.put(".env", f"/root/{IMAGE_NAME}/")
    
    # Deploy application
    with conn.cd(f"/root/{IMAGE_NAME}"):
        # Login to Docker Hub non-interactively
        if DOCKER_PASSWORD:
            conn.run(f"echo '{DOCKER_PASSWORD}' | docker login -u {DOCKER_USERNAME} --password-stdin")
        else:
            raise SystemExit("Error: DOCKER_PASSWORD environment variable is not set")
        
        # Pull the latest image
        conn.run("docker compose pull app")
        
        # Use docker-rollout for zero-downtime deployment
        conn.run("docker rollout -f docker-compose.yaml app")
        
        # Wait for services to stabilize
        time.sleep(10)
        
        # Check container status
        print("=== Container Status ===")
        conn.run("docker ps -a")
    
    print("Deployment completed successfully!")
    print(f"Application should be available at: http://{server_ip}")
    print(f"Traefik dashboard is available at: http://{server_ip}:8080") 