"use strict";

import * as Ajv from "ajv";
/**
 * This service validates the given data against the schema and other validation steps
 */
export class DataValidatorService {

    /* @ngInject */

    /**
     * @constructor
     * @external {$http} https://docs.angularjs.org/api/ng/service/$http
     */
    constructor($http){
        /**
         * stores the $http instance
         * @type {$http}
         */
        this.http = $http;
    }

    //TODO node datatype somewhere ?

    /**
     * Checks if a nodes children are unique in name and id
     * @param {Object} node
     * @returns {boolean} true if the node has unique children
     */
    hasUniqueChildren(node) {

        if(node.children && node.children.length > 0) {

            var names = {};
            var ids = {};

            for(var i=0; i<node.children.length; i++){
                ids[node.children[i].id] = true;
                names[node.children[i].name] = true;
            }

            if(Object.keys(names).length !== node.children.length || Object.keys(ids).length !== node.children.length){
                return false;
            } else {
                var valid = true;
                for(var j=0; j<node.children.length; j++){
                    valid = valid && this.hasUniqueChildren(node.children[j]);
                }
                return valid;
            }


        } else {
            return true;
        }

    }

    /**
     * validates the given file data against the schema file and checks for unique names in a parents direct children.
     * @param {Object} well formed fileContent (schema.json)
     * @returns {Promise} which resolves when the filecontent is valid, rejects with errors otherwise
     */
    validate(data) {

        return new Promise((resolve, reject) => {

            this.http.get("schema.json").then(
                (response) => {

                    if(response.status === 200) {
                        var ajv = Ajv.default();
                        var compare = ajv.compile(response.data);
                        var valid = compare(data);

                        if(!this.hasUniqueChildren(data.root)){
                            reject([{
                                "message":"names or ids are not unique",
                                "dataPath": "uniqueness"
                            }]);
                        }

                        if (valid) {
                            resolve();
                        } else {
                            reject(compare.errors);
                        }
                    } else {
                        reject([{
                            "message":response.status,
                            "dataPath": "http"
                        }]);
                    }

                }, (e)=>{
                    reject([{
                        "message":e,
                        "dataPath": "angular http"
                    }]);
                }
            );

        });

    }

}