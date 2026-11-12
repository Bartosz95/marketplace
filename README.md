# Marketplace (in development)

## Abstract

This repository contains the source code for the Marketplace application, a platform that enables users to list their own items for sale and purchase items from others, similar in concept to Facebook Marketplace. The application is built using an event-sourcing architecture.

## Technlogies

- Typescript - programming language
- ExpressJS - API application framework
- React - UI Framework
- Bootstrap - CSS framework
- Auth0 - authentication
- Stripe - payments
- AWS S3 Bucket - storage
- Postgres - database
- Docker Compose - runtime

![](docs/login.png)

## Description

This document is divided into several sections. The current section provides an overview of the project, including the services developed to support the application and the technologies used. Following this, you will find a Tutorial explaining how to use the application. Below the tutorial, the Requirements section outlines the necessary tools, and finally, the Installation section guides you through the setup process.

### Services overview

User interaction is handled through a website developed using React, with React Bootstrap serving as the dedicated CSS framework for styling. The data displayed on the website is retrieved from an API service built with Node.js and Express.js. For persistence, the application uses a PostgreSQL database, while an S3 bucket is employed for storing images. The diagram below illustrates the services that were implemented to build this application.

![](docs/graph.png)

### Event Sourcing architecture

The application is built using an Event Sourcing architecture pattern. Users can purchase items listed in the Marketplace, as well as create, update, archive, restore, and delete their own listings. Each of these actions generates an event that is stored in the event store table.

Process managers operate as separate applications responsible for handling these events and updating the states table based on the event type. This approach provides a complete history of user activity and listing changes.

The sample `LISTING_CREATED` events in `db-init.sql` use the `userId` field
expected by the listing projection and assign the demo listings to Marketplace
user `748f3744-8636-48a6-9eaa-fb79519b07f9`. The init script is only run when
PostgreSQL initializes an empty data directory. To reassign existing listings
and normalize their event payloads, run the migration from the repository root:

```
docker compose --env-file frontend/.env exec -T db psql -U default_user -d marketplace < db-migrations/20261103_assign_listings_to_user1.sql
```

The migration requires that user1 already exists in `states.users`. It updates
listing creation events and their current projection, but leaves historical
purchase seller records unchanged.

The diagram below illustrates the database tables created for this application.

![](docs/db.png)

## Tutorial

How to use this application? It is very simple. Main page looks like:

![](docs/logout.png)

### Login

You can browse and view listings without logging in. However, logging in allows you to purchase items and create your own listings. Click the Login button, and you will be redirected to the Auth0 page, where you will need to create an account. On the first authenticated request, the Users API verifies the account with Auth0 and provisions the local user record through the event stream. After successful authentication, you will be redirected back to the Marketplace, where you should see a dashboard similar to the example below.

Notice that the Login to add listing button has been replaced by the _+ Create Listing_ button, and next to it, you will find a _Filter By_ dropdown. On the far right of the navigation bar, the Login button is replaced by your account nickname and profile photo.

![](docs/login.png)

### View and buy listing

On the main page, each listing shows only one photo along with the item’s name and price. To view more details, you can click the View button, which will open the full listing and display the description. If the listing contains multiple photos, a carousel will automatically rotate through them every few seconds.

When you want to purchase an item, simply press the Buy button and it will be added to your purchases. You can review all the items you have bought by setting the Filter By option to Your Purchases.

![](docs/view.png)

### Add your listing

You can add a new item by pressing the + Create Listing button. To complete the process, you must upload at least one photo, set a price, and provide both a title and a description for the listing. For form validation project uses [Formik](https://formik.org/) module. Once your listing is added, it will appear on the main page alongside other listings. However, instead of displaying a View button like the others, your listings will feature a Modify button, allowing you to edit them at any time.

![](docs/add.png)

### Modify your listings

To view listings available for purchase, set the Filter By option to Your Active. You can modify the details of an existing listing by selecting Edit from the Listing Modify dropdown menu.

You can also Archive a listing, which makes it invisible to all users except you. This allows you the option to restore the listing at a later time. Alternatively, you may choose to Delete a listing permanently.

![](docs/modify.png)

### Filter and switchin beetween dark and light mode

All available application filters are presented here, along with the option to activate the light theme.

![](docs/light.png)

### Account details

To view your account details, click the button featuring your nickname, which is located on the right side of the navigation bar.

![](docs/account.png)

## Requirements

- Docker with the Compose plugin
- Node.js 26 LTS and npm for the frontend
- An Auth0 tenant
- An AWS S3 bucket for listing images (local development uses IAM credentials;
  EC2 uses an instance role)
- A Stripe account and Sandbox for payment testing

## Installation process

### Download the project

Clone the repository or download and unpack the [main branch ZIP](https://github.com/Bartosz95/marketplace/archive/refs/heads/main.zip):

```
git clone https://github.com/Bartosz95/marketplace.git
```

### Configure Auth0

In Auth0, create:

- A **Regular Web Application**. Add `http://localhost` to its Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins.
- An **API** with an identifier to use as the audience.
- A **Machine to Machine Application** authorized for the Auth0 Management API with the `read:users` permission. This is used to provision local user records from Auth0 profiles.

Use the tenant domain, API audience, and application credentials in the environment files below. The frontend redirect URI must match the Auth0 callback URL.

### Configure the backend

Create `backend/.env` (the file is git-ignored) and fill in the values for your setup:

```dotenv
# Compose uses these credentials to initialize the local PostgreSQL database.
DB_HOST=localhost
DB_PORT=5432
DB_USER=default_user
DB_PASSWORD=password
DB_NAME=marketplace

APP_LOG_LEVEL=info
APP_LOOP_TIMEOUT=1000

# Auth0 API and tenant
AUTH_AUDIENCE=<Auth0 API identifier>
AUTH_ISSUER_BASE_URL=https://<Auth0 tenant domain>/
AUTH_MANAGEMENT_DOMAIN=<Auth0 tenant domain>
AUTH_MANAGEMENT_CLIENT_ID=<Auth0 machine-to-machine client ID>
AUTH_MANAGEMENT_CLIENT_SECRET=<Auth0 machine-to-machine client secret>

# S3 bucket used to store and serve listing images
AWS_BUCKET_REGION=<AWS region>
AWS_BUCKET_NAME=<bucket name>
AWS_BUCKET_ARN=<bucket ARN>
AWS_BUCKET_ACCESS_KEY=<IAM access key ID>
AWS_BUCKET_SECRET_ACCESS_KEY=<IAM secret access key>
AWS_BUCKET_URL=<public base URL used to serve bucket objects>

# Stripe Sandbox credentials; see Stripe Connect payments below
STRIPE_SECRET_KEY=<Stripe Sandbox secret key>
STRIPE_WEBHOOK_SECRET=<Stripe webhook signing secret>
FRONTEND_URL=http://localhost
```

The Compose file supplies service-specific `APP_NAME`, `APP_PORT`, `APP_HOST`,
and `DB_HOST` values. It maps the gateway to `http://localhost:3000`. Local
development can use the AWS access keys above; on EC2, omit those two keys and
grant the instance role access to list, upload, and delete objects in the
configured bucket. Configure the bucket so the image URLs in `AWS_BUCKET_URL`
can be read by the browser.

### Configure the frontend

Create `frontend/.env`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_AUTH0_DOMAIN=<Auth0 tenant domain>
NEXT_PUBLIC_AUTH0_CLIENT_ID=<Auth0 Regular Web Application client ID>
NEXT_PUBLIC_AUTH0_AUDIENCE=<Auth0 API identifier>
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost
GRAFANA_ADMIN_PASSWORD=<choose-a-local-password>
```

Compose reads `GRAFANA_ADMIN_PASSWORD` from this file when starting Grafana.
This password is used only by the Grafana service; it is not included in the
frontend build. Keep the file local and do not commit it.

The `NEXT_PUBLIC_*` names must match the variables read by the frontend. Never
put Stripe secret keys, webhook signing secrets, AWS credentials, or Auth0
machine-to-machine credentials in the frontend environment file.

### Stripe Connect payments

Use the same Stripe **Sandbox** for `STRIPE_SECRET_KEY`, the Stripe CLI, and
the test payments. The backend secret key must be a Sandbox secret key
(`sk_test_...`). For the Compose listener, set `STRIPE_API_KEY` in
`backend/.env` to a test-mode API key accepted by the current Stripe CLI. A
restricted key created from Stripe's **Platform and marketplace payments**
template can be used; keep it private. Do not use a live-mode key.

The local listener is included in Compose under the `stripe-local` profile. The
Payment API requires a webhook signing secret on startup, so initially set
`STRIPE_WEBHOOK_SECRET` to a temporary placeholder, then start the services:

```bash
docker compose --env-file frontend/.env up --build -d
docker compose --env-file frontend/.env --profile stripe-local up -d stripe-cli
docker compose --env-file frontend/.env --profile stripe-local logs -f stripe-cli
```

Copy the `whsec_...` signing secret printed by Stripe CLI into
`STRIPE_WEBHOOK_SECRET` in `backend/.env` and recreate the Payment API:

```bash
docker compose --env-file frontend/.env up -d --force-recreate payment-api
```

The Compose listener forwards `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, and `checkout.session.expired` to the
Payment API. No Dashboard webhook destination or ngrok tunnel is needed for
local testing. Keep the listener running while generating test events.

To resend an existing Sandbox event while the listener is running, use its
Stripe event ID:

```bash
docker compose --env-file frontend/.env --profile stripe-local exec stripe-cli stripe events resend evt_<event_id>
```

The event must belong to the same Sandbox and its Checkout Session must match a
`CHECKOUT_SESSION_CREATED` event in the local event store.

The Users API owns Stripe seller-account creation, onboarding, and account
readiness. Sellers can open their profile and choose **Set up seller payments**
to create an Express account and continue Stripe onboarding. The onboarding
endpoint is `POST /api/v1/users/me/payment/onboarding-link`; payment status is
available from `GET /api/v1/users/me/payment/status`. The Listings API asks the
Users API to check seller readiness before accepting listing or purchase
requests. The Payment process manager creates Checkout sessions and handles
payment outcomes. Purchases are rejected until the seller's Stripe transfers
capability is active. Accounts are created as individuals, and Stripe onboarding
collects currently due requirements first; Stripe can request additional
information later if it becomes due. Seller onboarding pre-fills the seller's
email; legal identity, address, and payout details are collected from the seller
rather than inferred from their Auth0 display name or listing. Checkout uses a
destination charge: 95% is routed to the seller and a 5% application fee is
retained by the platform. Checkout pre-fills the buyer's email from the local
user record. Stripe Sandbox payments are simulated and do not move real funds.

### Build and run the project

Start the backend services, database, Prometheus, and Grafana from the
repository root:

```bash
docker compose --env-file frontend/.env up --build -d
```

The containerized frontend is available at [http://localhost](http://localhost).
The frontend image gets its public Auth0/API settings as build arguments from
`frontend/.env`.

Open [Grafana](http://localhost:3002) and sign in as `admin` with the password
you set above. The provisioned **Marketplace Operations** dashboard includes
service health, API request rate, HTTP 5xx rate and latency, event-worker
throughput and lag, payment reconciliation activity, and process CPU and
memory. Use the **Service** filter to focus on specific APIs or workers.

The bookmark panels show:

- **Latest event position**: the highest event position currently in the event
  store.
- **Worker bookmark position**: the last event position a worker successfully
  processed and saved.
- **Bookmark position lag**: the difference between the latest event position
  and that worker's bookmark. Event positions come from a database sequence,
  so gaps can occur; this is a position difference, not always an exact count
  of pending events.

Prometheus is available at [http://localhost:9090](http://localhost:9090).
Use its **Status → Targets** page to check whether service metrics are being
scraped. The Prometheus and Grafana ports are bound to localhost.

For frontend hot reload, stop the Compose UI and run the Next.js development
server from another terminal:

```bash
docker compose --env-file frontend/.env stop ui
cd frontend
npm ci
npm run dev
```

The frontend development script listens on port 80. Some systems require
elevated privileges to bind to this port; if so, configure a local development
port and allow its origin in both Kong's CORS configuration and Auth0. Open
[http://localhost](http://localhost) in your browser when using the default
port. To stop the Stripe listener when you are done testing, run
`docker compose --env-file frontend/.env --profile stripe-local stop stripe-cli`.

## AWS deployment (EC2 + Docker Compose)

The AWS deployment runs the application on one EC2 instance. GitHub Actions
builds the images, pushes them to private Amazon ECR repositories, and deploys
them through AWS Systems Manager using GitHub OIDC. The AWS setup uses
[`docker-compose.aws.yaml`](docker-compose.aws.yaml) and
[`.github/workflows/deploy-ec2.yml`](.github/workflows/deploy-ec2.yml).

### Before you start

You need:

- An AWS account and access to its AWS Management Console.
- An existing S3 bucket configured as described in [Configure the backend](#configure-the-backend).
- An Auth0 tenant and Stripe test-mode API key and webhook signing secret.
- Admin access to the GitHub repository settings.

Use the same AWS region for the EC2 instance and ECR repositories. Keep the
local `docker-compose.yaml` for local work; the AWS host uses
`docker-compose.aws.yaml`.

The steps below use `ap-southeast-2` as an example region. In the AWS Console,
choose your region from the menu in the upper-right corner and use that same
region throughout this guide.

### 1. Create the EC2 instance role

The instance role lets the server connect to Systems Manager, pull images from
ECR, and store listing images in your S3 bucket without AWS access keys.

1. In the AWS Console search box, type **IAM**, then open **Identity and
   Access Management (IAM)**.
2. In the left menu choose **Roles → Create role**.
3. For **Trusted entity type**, select **AWS service**. For **Service or use
   case**, select **EC2**, then choose **Next**.
4. Search for and select both of these permissions policies, then choose
   **Next**:
   - `AmazonSSMManagedInstanceCore`
   - `AmazonEC2ContainerRegistryReadOnly`
5. Name the role `MarketplaceEC2Role` and choose **Create role**.
6. Open the new role. Choose **Add permissions → Create inline policy**, open
   the **JSON** tab, and paste the contents of
   [`deploy/ec2-s3-policy.example.json`](deploy/ec2-s3-policy.example.json),
   replacing both instances of `<bucket-name>` with your S3 bucket name.
   Choose **Next**, name the policy `MarketplaceImageBucketAccess`, and choose
   **Create policy**.

### 2. Launch Ubuntu on EC2

1. In the AWS Console, search for **EC2** and choose **Launch instance**.
2. Enter a name such as `marketplace-prototype`.
3. Under **Application and OS Images**, choose **Ubuntu Server 26.04 LTS,
   64-bit (x86)**.
4. Under **Instance type**, select `t3.small`.
5. Under **Key pair**, choose **Proceed without a key pair**. You will connect
   through Systems Manager, not SSH.
6. Under **Network settings**, choose **Edit**:
   - Use the default VPC and a public subnet.
   - Enable **Auto-assign public IP**.
   - Create a security group with inbound **HTTP** (`80`) and **HTTPS** (`443`)
     rules from `0.0.0.0/0`. Do not add an SSH rule.
   - Leave the default outbound rule enabled so the host can download packages
     and container images.
7. Under **Configure storage**, use a 16 GiB encrypted `gp3` root volume.
8. Under **Advanced details**:
   - Set **IAM instance profile** to `MarketplaceEC2Role`.
   - Set metadata version to **V2 only** and **Metadata response hop limit**
     to `2`. This lets containers use the instance role for S3.
   - Expand **User data**, paste the complete contents of
     [`deploy/bootstrap-ubuntu.sh`](deploy/bootstrap-ubuntu.sh), including its
     first `#!/usr/bin/env bash` line.
9. Choose **Launch instance**. Wait until **Instance state** is `Running` and
   **Status check** is `2/2 checks passed`. Copy the **Instance ID** and
   **Public IPv4 address** from the instance details.
10. In **Systems Manager → Fleet Manager → Managed nodes**, wait for the
    instance to appear with **Ping status: Online**.

### 3. Create the ECR repositories

Amazon ECR stores the two private application images. Open **CloudShell** from
the AWS Console toolbar. In CloudShell, copy and run these commands. Replace
the example region if you chose a different one:

```bash
export AWS_REGION=ap-southeast-2
aws ecr create-repository --region "$AWS_REGION" --repository-name marketplace/backend
aws ecr create-repository --region "$AWS_REGION" --repository-name marketplace/frontend
LIFECYCLE_POLICY='{"rules":[{"rulePriority":1,"description":"Keep the five newest images","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":5},"action":{"type":"expire"}}]}'
aws ecr put-lifecycle-policy --region "$AWS_REGION" --repository-name marketplace/backend --lifecycle-policy-text "$LIFECYCLE_POLICY"
aws ecr put-lifecycle-policy --region "$AWS_REGION" --repository-name marketplace/frontend --lifecycle-policy-text "$LIFECYCLE_POLICY"
```

If a command reports that a repository already exists, continue with the
remaining commands. The lifecycle policy keeps the five most recent images.

### 4. Configure the application on EC2

1. In the AWS Console, open **Systems Manager → Session Manager → Start
   session**, select the instance, and choose **Start session**. If it is not
   listed, return to EC2 and check that `MarketplaceEC2Role` is attached and
   the Systems Manager node status is Online.
2. Create a free hostname at [DuckDNS](https://www.duckdns.org/), then set its
   IPv4 address to the EC2 public IPv4 address from section 2. Wait until the
   hostname resolves to that address before deploying; Caddy uses it to obtain
   an HTTPS certificate. DuckDNS provides a free subdomain, not a registered
   domain.
3. If this is a new setup, create the backend environment file. If
   `/opt/marketplace/backend/.env` already exists, edit it in place instead of
   copying over it, so you keep the credentials already configured. For a new
   setup only, run:

   ```bash
   sudo cp /opt/marketplace/deploy/backend.env.example /opt/marketplace/backend/.env
   ```

   Then open the file for editing:

   ```bash
   sudo nano /opt/marketplace/backend/.env
   ```

4. Replace every placeholder in the file:
   - Set `DB_PASSWORD` to a new, strong password. Use the same value only for
     this application database.
   - Set the Auth0 tenant, API audience, and machine-to-machine application
     values.
   - Set `APP_DOMAIN` to the DuckDNS hostname only (for example,
     `marketplace-example.duckdns.org`), with no scheme or trailing slash.
   - Set `FRONTEND_URL` to `https://` followed by that hostname, with no
     trailing slash.
   - Set the S3 bucket name, ARN, region, and browser-accessible image URL.
   - Set the Stripe test-mode secret key and webhook signing secret.
   - Leave `AWS_BUCKET_ACCESS_KEY` and `AWS_BUCKET_SECRET_ACCESS_KEY` unset;
     the EC2 role provides S3 access.
5. Save and exit nano with **Ctrl+O**, **Enter**, then **Ctrl+X**. Restrict
   access to the environment file:

   ```bash
   sudo chmod 600 /opt/marketplace/backend/.env
   ```

The database is created on first start and stored in the Docker volume
`marketplace-postgres` on the EC2 root disk. The AWS Compose file runs Caddy
as the public HTTPS endpoint; it obtains and renews a Let's Encrypt
certificate automatically. Keep inbound ports 80 and 443 open so certificate
issuance and HTTP-to-HTTPS redirects work.

### 5. Set up GitHub Actions deployment access

GitHub Actions uses OIDC to request short-lived AWS credentials. It does not
need AWS access keys stored in GitHub.

1. In the AWS Console, open **IAM → Identity providers**. If
   `token.actions.githubusercontent.com` is not already listed, choose
   **Add provider** → **OpenID Connect**, enter
   `https://token.actions.githubusercontent.com` as the provider URL, and
   `sts.amazonaws.com` as the audience.
2. In CloudShell, get your AWS account ID by running:

   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

3. In IAM, choose **Roles → Create role**. For the trusted entity, choose
   **Custom trust policy**. Replace `<account-id>` in
   [`deploy/github-actions-trust-policy.example.json`](deploy/github-actions-trust-policy.example.json)
   with the account ID from the previous step, paste the JSON into the policy
   editor, and choose **Next**. Name the role
   `MarketplaceGitHubDeployRole` and create it.
4. Open `MarketplaceGitHubDeployRole`. Choose **Add permissions → Create
   inline policy → JSON**. Paste the contents of
   [`deploy/github-actions-policy.example.json`](deploy/github-actions-policy.example.json)
   after replacing `<region>`, `<account-id>`, and `<instance-id>`. Choose
   **Next**, name the policy `MarketplaceGitHubDeploy`, and create it.
5. Copy the role's **ARN** from the role details page.
6. In GitHub, open the repository **Settings → Secrets and variables →
   Actions → Variables** and add:

   | Name | Value |
   | --- | --- |
   | `AWS_REGION` | The region used for EC2 and ECR |
   | `AWS_DEPLOY_ROLE_ARN` | ARN of `MarketplaceGitHubDeployRole` |
   | `EC2_INSTANCE_ID` | EC2 instance ID copied in section 2 |
   | `APP_URL` | `https://` followed by your DuckDNS hostname, no trailing slash |
   | `AUTH0_DOMAIN` | Auth0 tenant domain without `https://` |
   | `AUTH0_CLIENT_ID` | Auth0 Regular Web Application client ID |
   | `AUTH0_AUDIENCE` | Auth0 API audience |

### 6. Allow the application URL in Auth0 and deploy

1. In Auth0, open the Regular Web Application settings. Add the application
   HTTPS URL (`https://<your-duckdns-hostname>`) to **Allowed Callback URLs**,
   **Allowed Logout URLs**, and **Allowed Web Origins**, then save.
2. In GitHub, open **Actions → Deploy to EC2 → Run workflow**, select `main`,
   and start the workflow.
3. Wait for the workflow to finish. It checks the code, builds the frontend
   and backend Docker images, pushes them to ECR, then tells Systems Manager to
   start the Compose services.
4. Open the HTTPS application URL in a browser. Subsequent pushes to `main`
   automatically repeat the build and deployment.

If the EC2 public IPv4 address changes, update the DuckDNS record to the new
address. The free DuckDNS subdomain remains yours, so the Auth0 URLs and
frontend build URL do not need to change.

To develop locally, continue using the instructions above and the regular
`docker-compose.yaml`. The EC2 deployment uses a separate Compose file and
does not change your local development workflow.
