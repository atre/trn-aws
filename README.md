# AWS Cloud Infrastructure: DevOps Training Project

Welcome to the DevOps Training Project on AWS Cloud Infrastructure. This hands-on project is designed to develop skills in various DevOps practices using AWS, focusing on areas like networking, virtualization, infrastructure automation with CDKTF (Terraform), CI/CD processes, and containerization with Kubernetes (EKS).

## Project Overview

In this project, you'll build an automated VPC structure and an Elastic Kubernetes Service (EKS) cluster across three Availability Zones. The setup includes 3 Public Subnets and 3 Private Subnets with NAT Gateways for secure internet access. 

### Diagram of communication between repositories

![Alt text](image.png)


### Skills Focus

1. **Networking and Connectivity:** Setup and manage AWS VPC, subnets, and NAT gateways.
2. **Virtualization Technologies:** Utilize AWS EC2 and EKS services.
3. **Infrastructure Automation:** Implement infrastructure as code using CDKTF (Terraform).
4. **CI/CD Processes:** Explore CI/CD tools and practices.
5. **Containerization and Orchestration:** Manage container deployment with Kubernetes (EKS).

## Architecture Diagram

For a detailed view of the project's architecture, check out the [Architecture Diagram](https://app.diagrams.net/#G1pTg1G7edxog30GW0OU_-ng3Jb754tbUv).

## Getting Started

### Prerequisites

- An active AWS account.
- Familiarity with AWS services (VPC, EC2, EKS).
- Basic knowledge of Terraform and CDKTF.
- Understanding of Kubernetes and container concepts.

### Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/<your-github-username>/devops-training-project.git
   cd devops-training-project

2. **Configure AWS:**
    Set up your AWS CLI with the necessary credentials.

3. **Initialize CDKTF:**
   ```bash
   cdktf init
   ```

4. **Deploy Infrastructure:**
    ```bash
    cdktf deploy
    ```

### Usage

Modify the Terraform configurations as needed and use cdktf commands for infrastructure management.