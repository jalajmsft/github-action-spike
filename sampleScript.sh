echo "what is your name?"
remark="az webapp list --query '[?state==\"Running\"]'"
echo "I am $remark too!"
$remark
az account show