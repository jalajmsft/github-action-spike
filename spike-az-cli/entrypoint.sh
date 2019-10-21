#!/bin/bash

echo "command is $sampleInput"

echo "login into az"
servicePrincipalId = credsObject["clientId"];
servicePrincipalKey = credsObject["clientSecret"];
tenantId = credsObject["tenantId"];
subscriptionId = credsObject["subscriptionId"];

if [[ -n "$servicePrincipalId" ]] && [[ -n "$servicePrincipalKey" ]] && [[ -n "$tenantId" ]]
then
  az login --service-principal --username "$servicePrincipalId" --password "$servicePrincipalKey" --tenant "$tenantId"
else
  echo "One of the required parameters for Azure Login is not set: servicePrincipalId, servicePrincipalKey, tenantId." >&2
  exit 1
fi

if [[ -n "$subscriptionId" ]]
then
  az account set --s "$subscriptionId"
else
  SUBSCRIPTIONS=$(az account list)
  if [[ ${#SUBSCRIPTIONS[@]} -gt 1 ]]
  then
    echo "subscriptionId is not set." >&2
    exit 1
  fi
fi

sh -c "$sampleInput"