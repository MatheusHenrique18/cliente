var cadastroCliente = angular.module("cadastroCliente", []);
cadastroCliente.directive("phoneDir", PhoneDir);
cadastroCliente.filter("cepFilter", cepFilter);
cadastroCliente.filter("telFilter", telFilter);
cadastroCliente.filter("cpfFilter", cpfFilter);

cadastroCliente.controller("clienteController", function($scope, $http, clienteAPI){
    $scope.app = "Cadastro de Clientes";
    $scope.mensagemErro = "";
    $scope.mensagemSucesso = "";
    $scope.listaClientes = [];
    $scope.cliente = {
    };

    $scope.objInvalido = {};

    $scope.email = {};
    $scope.listaEmailsAdicionados = [];

    $scope.telefone = {};
    $scope.listaTelefonesAdicionados = [];




    console.log("***funcionando");
    
    $scope.teste = "sucesso";
    
    //apenas para indicar id do novo registro a ser criado pelo usuário
    $scope.sequenceID = 0;

    function listarClientes(){
        clienteAPI.getClientes().then(function(response){
            $scope.listaClientes =  response.data
            console.log("***response",  $scope.listaClientes);

            // INSERINDO MASCARA DE TELEFONE AO LISTAR CLIENTES
            $scope.listaClientes.forEach(cliente => {
                cliente.listaTelefone.forEach(telefone => {
                   telefone.numero = inserirMascaraTelefoneListagem(telefone.numero);
               });
           });

        },function(error){
            error = "não foi possível listar os clientes";
            console.log(error);
        });
    }


    function inserirMascaraTelefoneListagem(telefone){
        var telefoneComMascara = '';

        if(telefone.length === 11){
            var celular = telefone;
            var dddCelMask = "(" + celular.substring(0,2) + ")";
            var celMaskPt2 = "-" + celular.substring(celular.length - 4); 
            var celMaskPt1 = celular.substring(2,7);
            telefoneComMascara = dddCelMask + " " + celMaskPt1 + celMaskPt2;
        }
        else if(telefone.length === 10){
            var fixo = telefone;
            var dddFixMask = "(" + fixo.substring(0,2) + ")";
            var fixMaskPt2 = "-" + fixo.substring(fixo.length - 4);  
            var fixMaskPt1 = fixo.substring(2,6);
            telefoneComMascara = dddFixMask + " " + fixMaskPt1 + fixMaskPt2;
        }

        return telefoneComMascara;
    }

    $scope.buscarCep = function(cep){
        
        var cepSemMascara = retirarMascara(cep);
        console.log("***cep sem mascara", cepSemMascara);

        if(cepSemMascara.length > 7){
            clienteAPI.getEndereco(cepSemMascara).then(function(response){
                var data = response.data
                console.log("***response", data);
    
                $scope.cliente.logradouro = data.logradouro;
                $scope.cliente.bairro = data.bairro;
                $scope.cliente.cidade = data.localidade;
                $scope.cliente.uf = data.uf;
                $scope.cliente.complemento = data.complemento;
    
            },function(error){
                error = "api via cep não respondeu, ou não encontrou o cep";
                console.log(error);
            });
        }
    }

    function retirarMascara(cpfouCnpj){
        return cpfouCnpj.replace(/[^\d]+/g,'');
    }

    $scope.salvarCliente = function(cliente){

        if($scope.listaTelefonesAdicionados.length > 0){

            $scope.listaTelefonesAdicionados.forEach(telefoneAdicionado => {
                var auxNumero = retirarMascara(telefoneAdicionado.numero);
                telefoneAdicionado.numero = auxNumero;
            });
            
            cliente.listaTelefone = $scope.listaTelefonesAdicionados;
        }else{
            cliente.listaTelefone = [];
        }
        
        cliente.listaEmail = $scope.listaEmailsAdicionados.length > 0 ? $scope.listaEmailsAdicionados : [];
        cliente.cep = retirarMascara(cliente.cep);
        cliente.cpf = retirarMascara(cliente.cpf);

        if(cliente.listaTelefone.length > 0 && cliente.listaEmail.length > 0){
            clienteAPI.saveCliente(cliente).then(function(response){
                var data = response.data
                console.log("***response", data);
    
                $scope.limparCampos();
                listarClientes();
    
                $scope.mensagemSucesso = "Cliente salvo com sucesso.";
                $scope.mensagemErro="";
                window.scrollTo(0, 0);
    
            },function(error){
                error = "não foi possível cadastrar o clientes";
                console.log(error);
            });
        }else{
            $scope.mensagemErro = "Para cadastrar um Cliente é necessário incluir pelo menos UM Telefone e UM Email.";
            window.scrollTo(0, 0);
        }
    }

    $scope.adicionarTelefone = function(telefone){
        if(telefone.numero !== undefined && (telefone.tipo !== null)){

            if(telefone.tipo === "Celular"){
                if(telefone.numero.length === 15){
                    $scope.listaTelefonesAdicionados.push(telefone);
                    $scope.telefone = {};
                }
                else{
                    alert("Celular Inválido");
                }
            }else{
                if(telefone.numero.length === 14){
                    $scope.listaTelefonesAdicionados.push(telefone);
                    $scope.telefone = {};
                }else{
                    alert("Telefone inválido");
                }
            }
            
        }
    }

    $scope.removerTelefone = function(telefone){
        var indexT = $scope.listaTelefonesAdicionados.indexOf(telefone);
        $scope.listaTelefonesAdicionados.splice(indexT, 1);
    }

    $scope.adicionarEmail = function(email){
        if(email.email !== undefined && email.email.length > 3){
            var isEmailValido = validateEmail(email.email);
            if(isEmailValido){
                $scope.listaEmailsAdicionados.push(email);
                $scope.email = {};
            }
            else{
                alert("Email inválido");
            }
        }
    }

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    $scope.removerEmail = function(email){
        var indexE = $scope.listaEmailsAdicionados.indexOf(email);
        $scope.listaEmailsAdicionados.splice(indexE, 1);
    }

    $scope.clearMessages = function(){
        $scope.mensagemErro = "";
        $scope.mensagemSucesso = "";
    };

    listarClientes();

    $scope.limparCampos = function(){
        $scope.cliente = {};
        $scope.listaTelefonesAdicionados = [];
        $scope.listaEmailsAdicionados = [];
        $scope.clienteForm.$setUntouched();
    }

    $scope.excluirCliente = function(idCliente){
        if(window.confirm("Confirma a exclusão do Cliente ?")){
            clienteAPI.deleteCliente(idCliente).then(function(response){
                var data =  response.data
                listarClientes();
                console.log("***EXCLUSÃO FEITA COM SUCESSO",  data);
            },function(error){
                error = "não foi possível excluir o cliente";
                console.log(error);
            });
        }
    }

    $scope.editarCliente = function(idCliente){
        clienteAPI.getClienteById(idCliente).then(function(response){
            var clienteRecuperado =  response.data
            $scope.listaEmailsAdicionados = clienteRecuperado.listaEmail;
            $scope.listaTelefonesAdicionados = clienteRecuperado.listaTelefone;
            $scope.cliente = clienteRecuperado;

            // INCLUINDO MASCARA DE TELEFONE AO RECUPERAR CLIENTE PELO ID
            $scope.cliente.listaTelefone.forEach(telefone => {
                telefone.numero = inserirMascaraTelefoneListagem(telefone.numero);
            });

            window.scrollTo(0, 0);
            console.log("***Cliente editar", clienteRecuperado);
        },function(error){
            error = "não foi possível encontrar o cliente";
            console.log(error);
        });
    }

});

function PhoneDir() {
    return {
      link : function(scope, element, attrs) {
          var options = {
              onKeyPress: function(val, e, field, options) {
                  putMask();
              }
          }
  
          $(element).mask('(00) 00000-0000', options);
  
          function putMask() {
              var mask;
              var cleanVal = element[0].value.replace(/\D/g, '');//pega o valor sem mascara
              if(cleanVal.length > 10) {//verifica a quantidade de digitos.
                  mask = "(00) 00000-0000";
              } else {
                  mask = "(00) 0000-00009";
              }
              $(element).mask(mask, options);//aplica a mascara novamente
          }
      }
    }
}

function cepFilter(){
    return function(input) {
        var str = input+ '';
          str = str.replace(/\D/g,'');
          str=str.replace(/^(\d{2})(\d{3})(\d)/,"$1.$2-$3");
      return str;
    }
}

function telFilter() {
    return function(input) {
        var str = input+ '';
          str = str.replace(/\D/g,'');
          if(str.length === 11 ){
          str=str.replace(/^(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');
          }else{
          str=str.replace(/^(\d{2})(\d{4})(\d{4})/,'($1) $2-$3');
          }
      return str;
        }
}

function cpfFilter() {
    return function(input) {
        var str = input+ '';
        str = str.replace(/\D/g,'');
        str = str.replace(/(\d{3})(\d)/,"$1.$2");
        str = str.replace(/(\d{3})(\d)/,"$1.$2");
        str = str.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
      return str;
    }
}