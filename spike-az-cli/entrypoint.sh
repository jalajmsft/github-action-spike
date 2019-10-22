#!/bin/bash

echo "command is $1"

echo  "dummy obj is $5"

echo "val 1 is $5['abc']"
echo "val 1 is $5[abc]"

echo "login into az"
servicePrincipalId = $2
servicePrincipalKey = $3
tenantId = $4
# subscriptionId = $2[subscriptionId]
subscriptionId = "abc"

if [[ -n "$2" ]] && [[ -n "$3" ]] && [[ -n "$4" ]]
then
  az login --service-principal --username "$2" --password "$3" --tenant "$4"
else
  echo "One of the required parameters for Azure Login is not set: servicePrincipalId, servicePrincipalKey, tenantId." >&2
  exit 1
fi
# if [[ -n "$servicePrincipalId" ]] && [[ -n "$servicePrincipalKey" ]] && [[ -n "$tenantId" ]]
# then
#   az login --service-principal --username "$servicePrincipalId" --password "$servicePrincipalKey" --tenant "$tenantId"
# else
#   echo "One of the required parameters for Azure Login is not set: servicePrincipalId, servicePrincipalKey, tenantId." >&2
#   exit 1
# fi

# if [[ -n "$subscriptionId" ]]
# then
#   az account set --s "$subscriptionId"
# else
#   SUBSCRIPTIONS=$(az account list)
#   if [[ ${#SUBSCRIPTIONS[@]} -gt 1 ]]
#   then
#     echo "subscriptionId is not set." >&2
#     exit 1
#   fi
# fi

sh -c "$1"