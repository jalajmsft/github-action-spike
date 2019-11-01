echo "what is your name?"
remark="az --version"
echo "I am $remark too!!"
$remark
az vm create -n jaminda-azcli-t3 -g jaminda-az-cli --image debian --subscription RMDev --authentication-type all --admin-password ${{ secrets.Azure_cred_login_obj }} --admin-username jaminda
az account show
