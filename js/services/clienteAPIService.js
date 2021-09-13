var cadastroCliente = angular.module("cadastroCliente");

cadastroCliente.factory("clienteAPI", function($http){

    var apiCliente = "http://localhost:8080/api/cliente";

    var _getClientes = function(){
        return $http.get(apiCliente);
    };

    var _getClienteById = function(id){
        return $http.get(apiCliente+"/"+id);
    }
    
    var _saveCliente = function(cliente){
        return $http.post(apiCliente, cliente);
    };

    var _deleteCliente = function(id){
        return $http.delete(apiCliente+"/"+id);
    };

    var _getEndereco = function(cep){
        return $http.get("https://viacep.com.br/ws/"+cep+"/json");
    };
    

    return{
        getClientes: _getClientes,
        getClienteById: _getClienteById,
        saveCliente: _saveCliente,
        deleteCliente: _deleteCliente,
        getEndereco: _getEndereco
    };
});