echo "what is your name?"
remark="az --version"
echo "I am $remark too!!"
$remark
az vm create -n jaminda-azcli-t8 -g jaminda-az-cli --image debian --subscription RMDev --authentication-type all --admin-password ${{ secrets.az_cli_test_vm_password }} --admin-username jaminda
az account show
