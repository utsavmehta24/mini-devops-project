# EC2 SSH Connection Timeout - Troubleshooting Guide

## Problem
GitHub Actions cannot connect to EC2 instance via SSH (timeout error: `dial tcp ***:22: i/o timeout`)

## Solutions (Check in Order)

### 1. Verify EC2 Instance is Running
```bash
# Check in AWS Console:
# EC2 Dashboard → Instances → Check instance state should be "running"
```

### 2. Update EC2 Security Group (Most Common Fix)
Your EC2 security group needs to allow SSH (port 22) from GitHub Actions IPs.

**Option A: Allow from anywhere (Simple but less secure)**
```
Type: SSH
Protocol: TCP
Port: 22
Source: 0.0.0.0/0
Description: GitHub Actions SSH
```

**Option B: Allow only GitHub Actions IPs (More secure)**
Add these IP ranges to your security group:
- Go to: https://api.github.com/meta
- Look for "actions" IP ranges
- Add each range as a separate inbound rule

Current GitHub Actions IP ranges (may change, verify at link above):
```
4.175.114.64/26
20.102.39.128/26
20.81.127.64/26
20.9.156.128/26
And others...
```

**Steps to update Security Group:**
1. Go to AWS Console → EC2 → Security Groups
2. Find the security group attached to your EC2 instance
3. Edit Inbound Rules
4. Add rule:
   - Type: SSH
   - Port: 22
   - Source: 0.0.0.0/0 (or specific GitHub IPs)
5. Save rules

### 3. Verify EC2_HOST Secret
The `EC2_HOST` secret should contain your EC2 instance's **public IP** or **public DNS**.

**Find your EC2 Public IP:**
1. AWS Console → EC2 → Instances
2. Select your instance
3. Look for "Public IPv4 address" or "Public IPv4 DNS"
4. Copy the value

**Update GitHub Secret:**
1. Go to: https://github.com/utsavmehta24/mini-devops-project/settings/secrets/actions
2. Find `EC2_HOST` secret
3. Update with correct public IP/DNS
4. Format should be: `3.123.45.67` or `ec2-3-123-45-67.compute-1.amazonaws.com`

### 4. Verify EC2_KEY Secret
The `EC2_KEY` secret should contain your **private SSH key** (PEM file content).

**Format should be:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
...
-----END RSA PRIVATE KEY-----
```

**Update GitHub Secret:**
1. Go to: https://github.com/utsavmehta24/mini-devops-project/settings/secrets/actions
2. Find `EC2_KEY` secret
3. Paste the entire content of your `.pem` file (including BEGIN/END lines)

### 5. Check EC2 SSH Configuration
SSH into your EC2 instance manually and verify:

```bash
# Ensure SSH is running
sudo systemctl status ssh

# Ensure SSH is listening on port 22
sudo netstat -tulpn | grep :22

# Check SSH config
sudo cat /etc/ssh/sshd_config | grep "PermitRootLogin\|PasswordAuthentication"
```

### 6. Elastic IP (Recommended)
If your EC2 instance restarts, its public IP changes. Use an Elastic IP to keep it constant:

1. AWS Console → EC2 → Elastic IPs
2. Allocate new Elastic IP
3. Associate it with your EC2 instance
4. Update `EC2_HOST` secret with the Elastic IP

## Quick Test

Run the diagnostic workflow:
1. Go to: https://github.com/utsavmehta24/mini-devops-project/actions
2. Select "Test EC2 Connection" workflow
3. Click "Run workflow"
4. Check the logs to see which test fails

## Most Likely Fix

**The most common issue is Security Group configuration.**

Quick fix command (if you have AWS CLI):
```bash
# Replace sg-xxxxx with your security group ID
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

## After Fixing

1. Update the security group or secrets
2. Re-run the deployment workflow
3. It should connect successfully

---

**Need Help?**
If none of these work, check:
- EC2 instance subnet has an Internet Gateway attached
- Route table has route to Internet Gateway (0.0.0.0/0 → igw-xxx)
- Network ACLs allow SSH traffic
