#!/bin/bash

# Find the Vault pod by label
# Adjust the label selector as needed based on your Helm chart's labeling
VAULT_POD=$(kubectl get pod -l app.kubernetes.io/name=vault -o jsonpath="{.items[0].metadata.name}")

if [ -z "$VAULT_POD" ]; then
  echo "Vault pod not found"
  exit 1
fi

echo "Vault pod identified: $VAULT_POD"

# Initialize Vault and capture the keys and root token
INIT_OUTPUT=$(kubectl exec $VAULT_POD -- vault operator init -key-shares=1 -key-threshold=1 -format=json)
echo $INIT_OUTPUT > init-keys.json

# Extract the unseal key and root token
VAULT_UNSEAL_KEY=$(echo $INIT_OUTPUT | jq -r ".unseal_keys_b64[0]")
VAULT_ROOT_TOKEN=$(echo $INIT_OUTPUT | jq -r ".root_token")

# Unseal Vault
kubectl exec $VAULT_POD -- vault operator unseal $VAULT_UNSEAL_KEY

# Optionally, login to Vault (though consider the security implications)
# kubectl exec $VAULT_POD -- vault login $VAULT_ROOT_TOKEN

echo "Vault is initialized and unsealed. Root token is: $VAULT_ROOT_TOKEN"
