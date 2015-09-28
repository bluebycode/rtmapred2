/*jslint node: true */
'use strict';

var util = require('util'),
    redis   = require('redis'),
    Q       = require('q'),
    events  = require('events');

/**
 *
var source = new Datasource.node({
  host: 'localhost',
  port: 7379,
  poolSize: 15
});
 */

var mod = {
  RedisDatasource: {
    node: function(configuration){
      console.log(util.format('host: %s, port: %d, pool: %d', configuration.host, configuration.port, configuration.poolSize));
      events.EventEmitter.call(this);

      var self = this;
      this._host = configuration.host;
      this._port = configuration.port;
      this._maxConnections = configuration.poolSize;

      function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
      }

      /**
       * Crea y establece una conexión con la fuente de datos, con un intento máximo
       * de 3 veces y un timeout de 2 segundos.
       * @param  {String/Number} id identificador
       * @return {Premise} premisa de conexión
       */
      this._create = function(id){
        var defer = Q.defer();
        var client = redis.createClient(self._port, self._host,{
          connect_timeout: 2000,
          max_attempts: 3 // 3 retries!
        });
        client._id = id;
        client.on('connect', function(error){
          defer.resolve(this);
          client.on('error', function(error){
            console.log('[Error]', error);
          });
        });
        return defer.promise;
      };
      /**
       * Recupera una conexion disponible del pool de conexiones.
       * @return {connection}
       */
      this._select = function(ceil){
        if (!self._connections ||self._connections.length === 0 ) {
          throw new Error('pool not ready yet');
        }

        // Obtiene un índice aleatorio entre el numero
        // de conexiones disponibles
        var index = random(0,self._connections.length);
        return self._connections[index].value;
      };

      this.select = function(){
        return this._select(0);
      };

      // Desplegando premisas de conexiones sobre la fuente de datos
      var _future_connections = Array.apply(null, Array(this._maxConnections)).map(function (_, n) {
        return self._create();
      })

      // Una vez que todas las conexiones esten disponibles
      // se notificará por los eventos: ready e initialisated.
      // pool.on('ready', function(context){
      //    var new_connection = context.conn();
      //    ...
      // });
      Q.allSettled(_future_connections)
        .then(function(connections){
          self._connections = connections;
          self.emit('initialisated', self._select());
          self.emit('ready', {
            conn: self._select
          });
        });
    }
  }
};
module.exports = mod;

util.inherits(mod.RedisDatasource.node, events.EventEmitter);
