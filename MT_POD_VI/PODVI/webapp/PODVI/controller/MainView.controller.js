sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (jQuery, PluginViewController, JSONModel ,   MessageToast,
    Filter,
    FilterOperator) {
	"use strict";

    
    const apis = {
        getSfcWorkList: "sfc/v1/worklist/sfcs",
        getNcDetails: "nonconformance/v1//nonconformances",
        getOrdersList: "order/v1/orders/list",
        getOrderDetails: "order/v1/orders",
        getSfcDetails: "sfc/v1/sfcdetail",
        getShifts: "shift/v1/shifts",
        getWorkCenters: "workcenter/v2/workcenters",
        getOrdersBAPI: "pe/api/v1/process/processDefinitions/start?key=REG_8da871f5-123e-40f2-936b-e9c6080584fb&async=false",
        releaseOrdersBAPI: "pe/api/v1/process/processDefinitions/start?key=REG_8da871f5-123e-40f2-936b-e9c6080584fb&async=false",
        getPlantDetails: "plant/v1/plants",
        getBOMDetails: "/bom/v1/boms",
        postdclog: "datacollection/v1/log",
        getdclog: "datacollection/v1/measurements"
    }

    const mdos = {
        sfcStepStatus: "dmci/v1/extractor/SfcStepStatus",
        nonconformance: "dmci/v1/extractor/NonConformance"
    }
    let controller, view, podConfigs, _oDialog;



	return PluginViewController.extend("mt.custom.plugin.PODVI.PODVI.controller.MainView", {


        pageData: {

          filterData: {
            sfc: "" ,// Default value,
            order: ""
        },


            orders: [],
            OrderDetails: [
                ],
                SFCDetails: [
                    {
                        sfc: "",
                        VI: "",
                        Weights: ""
                    }]
            },



		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);


            // Get all the configuration

            view = this.getView();

            this.getPlantDetails();
            view.setModel(this.pageModel, 'mainModel');
        
           view.setBusy(true);
           podConfigs = this._getConfiguration();
           let workcenter = podConfigs.Workcenter;
           let viDC = podConfigs.DCVI;
           let viWeights =  podConfigs.DCWeight;
           let viCMMI = podConfigs.CMMFileupload;
           let viCustomer = podConfigs.DCCustomer;
           let viSubstrate = podConfigs.ViewSubstrate;

           if (viDC == "")
           {

            this.getView().byId("vi").setVisible(false);

           }
           else
           {
            this.getView().byId("vi").setVisible(true);

           }
           if (viWeights == "")
           {
            this.getView().byId("weight").setVisible(false);
            }
            else
            {
                this.getView().byId("weight").setVisible(true);    
            }

        if (viCMMI == "")
                    {
         
                    }

        if (viCustomer == "")
            {
                this.getView().byId("customer").setVisible(false);
             }
             else
             {
                this.getView().byId("customer").setVisible(true);   
             }

                        if (viSubstrate == "")
                            {
                 
                            }

   


            // Get all the Orders on the WC
            let promiseArray = [
              
                this._loadOrders(workcenter)
            ]

            view.setBusy(false);

            // Show the select order SFCs in the list


            

			           
            
		},


        // Enable selection of new orders
        // Start and complete and record when all is completed.




        onAfterRendering: function(){
           
            
       //     this.getView().byId("headerTitle").setText(this.getConfiguration().title);
        //    this.getView().byId("textPlugin").setText(this.getConfiguration().text); 

        },

		onBeforeRenderingPlugin: function () {

			
			
		},

        isSubscribingToNotifications: function() {
            
            var bNotificationsEnabled = true;
           
            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function(sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function(sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function(oMsg) {
           
            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name){
                        case "template":
                            
                            break;
                        case "template2":
                            
                        
                        }        
          

                    
                }
            }

        },
        _loadOrders: function (workcenter) {
            return this.get(apis.getSfcWorkList, {
                "plant": this.getPlant()
            }).then(res => {
                if (res && Array.isArray(res)) {

                  if (!this.pageModel) {
                    this.pageModel = new sap.ui.model.json.JSONModel(); //
                    this.getView().setModel(this.pageModel, "pageModel"); // 
                }
                
                this.pageModel.setProperty('/orders', res); 

                this.pageModel.setProperty('/sfc', res[0].sfc);
             
                this.getView().setBusy(true);
                this.publishFilterChange(res[0].order);
                this.getView().setBusy(false);
             
             

                }

            }).catch((err) => {
                console.error(err)
                err.message && MessageToast.show(err.message)
            })
        },

        onOrderPress: function(oEvent)
        {

          podConfigs = this._getConfiguration();
  
          let viDC = podConfigs.DCVI;


          let oSelectedItem = oEvent.getParameter("listItem");


          if (!oSelectedItem) {
              return; // No item selected, exit function
          }
         
      
          let sSFCTitle = oSelectedItem.getTitle();  

          this.pageModel.setProperty('/sfc', sSFCTitle);
          // get measurements into new card

          let vi = this.getView().byId("vi").getVisible();
          if(vi)
          {

            this.publishDCValues(sSFCTitle,viDC);


          }


          // log files

          console.log("Selected Order Title:", sOrderTitle);


        },

      




        

        onOrderLiveChange: function (oEvent) {
            let sValue = oEvent.getParameter("value");
            let aFilter = []
            var oBinding = oEvent.getParameter("itemsBinding");
            if (sValue && sValue.length > 0) {
                aFilter = [
                    new Filter("orders", FilterOperator.Contains, sValue),
                    new Filter("description", FilterOperator.Contains, sValue),
                ]
                oBinding.filter(new Filter(aFilter, false));
            } else {
                oBinding.filter([]);
            }
        },
        onOrderChange: function (oEvent) {
            let sWc = oEvent.getSource().getValue()
            if (!this.pageModel.getProperty('/orders').find(wc => wc.workCenter === sWc)) {
                oEvent.getSource().setValueState('Error')
            } else {
                oEvent.getSource().setValueState('None')
            }
        },

        onSubmitVI:function(oEvent)
        {
          podConfigs = this._getConfiguration();
  
          let viDC = podConfigs.DCVI;

         let sfc1 =  this.pageModel.getProperty('/sfc');

         //get the values for comment
         //get the values for the filter
         //get the values for weight

          this.posthDCValues(sfc1,viDC, viDC, "1", "Hello") ;



        },
        onOrderSelect: function (oEvent) {


          let selectedItem = oEvent.getParameter("selectedItem");

          if (!selectedItem) {
              return; // No item selected, exit function
          }
      
          // Get the binding context of the selected item
          let oContext = selectedItem.getBindingContext("pageModel");
      
          if (oContext) {
              let oSelectedData = oContext.getObject(); // Get full object data
      
              // Extract individual fields
              let selectedOrder = oSelectedData.order;
              let selectedMaterial = oSelectedData.material;
              let selectedQuantity = oSelectedData.quantity;
              let selectedStatus = oSelectedData.status;
      

            let selectedWC = selectedOrder;
         
            this.pageModel.setProperty('/filterData/order', selectedWC);
        
            this.getView().byId("idOrderInput").setValue(selectedWC);
            this.getView().setBusy(true);
            this.publishFilterChange(selectedWC);
            this.getView().setBusy(false);
          }
        },

        openOrdersDialog: function () {
          var oView = this.getView(); // ✅ Get the main view
      
          // Check if the dialog fragment already exists
          if (!this._oDialog) {
              this._oDialog = sap.ui.xmlfragment(
                  "mt.custom.plugin.PODVI.PODVI.view.fragments.Orders", // ✅ Path to fragment
                  this
              );
              oView.addDependent(this._oDialog); // ✅ Attach fragment to the view
      
              // Ensure the correct model is set
              this._oDialog.setModel(oView.getModel("pageModel"), "pageModel");
          }
      
          this._oDialog.open(); // ✅ Open the dialog
      },

      posthDCValues: async function (sfc,dcgroup, dcparameters, value, comment) {
        try{
       
            await this._postdc(sfc,dcgroup,dcparameters,value,comment)
         
        }catch(err){
          sap.m.MessageToast.show('Application Error: '+err)
         
        }
      
        //console.log('mainModel', this.pageModel.getData())
    },

    _postdc: function (sfc1,dcgroups, dcparameters, valuep, commentp) {


   
     let  postingDateTime1 = new Date().toISOString()
     let oVersion = "A";
     let payload = {
         group: {
           dcGroup: dcgroups,
           version: oVersion
         },
         plant: this.getPlant(),
         sfc: sfc1,
         parameterValues : [{ name: dcgroups, value:valuep, comment: commentp }]

     };

      return this.post(apis.postdclog,payload ).then(res => {

          return res
      })
  },




      publishDCValues: async function (sfc,dcgroup) {
        try{
       
            await this._getdcmeasurements(sfc,dcgroup)
         
        }catch(err){
          sap.m.MessageToast.show('Application Error: '+err)
         
        }



      
        //console.log('mainModel', this.pageModel.getData())
    },

       /********** get orders data **********/
       _getdcmeasurements: async function (sfc,dcgroup) {

          
           
        let oDCValues = await this._getDCDetails(sfc,dcgroup)    ;

        if(oDCValues.count == 0)
        {
          this.pageModel.setProperty('/vicomment', "");
          this.pageModel.setProperty('/viresult', 0);

        }
        else
     
         this.pageModel.setProperty('/vicomment', oDCValues);
         this.pageModel.setProperty('/viresult', 0);

       },



      publishFilterChange: async function (order) {
        try{
       
            await this._setOrders(order);
         
        }catch(err){
          sap.m.MessageToast.show('Application Error: '+err)
         
        }



      
        //console.log('mainModel', this.pageModel.getData())
    },

            /********** get orders data **********/
      _setOrders: async function (order) {

          
           
          let oOrder = await this._getOrderDetails(order)    ;
         // let BOMDetails = await this._getBOMDetails(oOrder.bom.bom,oOrder.bom.version)  
             
        
       

           this.pageModel.setProperty('/OrderDetails', oOrder);

           this.pageModel.setProperty('/sfcs', oOrder.sfcs );


        //   this.pageModel.setProperty('/BOMDetails', BOMDetails[0].components);
          
          },

          _getOrderDetails: function (order) {
            return this.get(apis.getOrderDetails, {
                plant: this.getPlant(),
                order: order,
                expand: "BOM"
            }).then(res => {

                return res
            })
        },

        _getDCDetails: function (sfc,dcgroup1)
        {
          let sfcArray = [sfc];  // Single SFC inside an array
          let version = "A";
          return this.get(apis.getdclog, {
            plant: this.getPlant(),
            sfcs: sfcArray,
            'dcGroup.name': dcgroup1,
            'dcGroup.version':version

        }).then(res => {

            return res
        })

        },

        

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		},




        _getConfiguration: function () {
            if (this.getPodController()) {
              return this.getConfiguration()
            } else {
              return localPodConfigs;
            }
          },
          _getPodController: function () {
            if (this.getPodController()) {
              return this.getPodController();
            }
            return this;
          },
          getPlant: function () {
            if (this.getPodController()) {
              return this.getPodController().getUserPlant();
            } else {
              return this.zPodSelectionModel.getProperty("/loginData/plant");
            }
          },
          getUser: function () {
            if (this.getPodController()) {
              return this.getUserId();
            } else {
              return this.zPodSelectionModel.getProperty('/loginData/userId')
            }
          },

          
          getPlantDetails: async function () {
            try{
            if (this.plantDetails) {
              return Promise.resolve(this.plantDetails)
            }
            return this.get(apis.getPlantDetails, {
              plant: this.getPlant()
            }).then(res => {
              this.plantDetails = res[0];
              return this.plantDetails
            })
          }catch
          {


          }
          },
          get: function (api, params) {
            return new Promise((resolve, reject) => {
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxGetRequest(
                  this.getApiUrl(api),
                  params,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: this.getApiUrl(api),
                  method: "GET",
                  headers: {
                    "X-Dme-Plant": controller.getPlant(),
                  },
                  data: params,
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
  
            });
          },
          getoData: function (api, params) {
            return new Promise((resolve, reject) => {
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxGetRequest(
                  this.getoDataUrl(api),
                  params,
                  resolve,
                  reject
                );
              } else {
                $.ajax({
                  url: this.getoDataUrl(api),
                  method: "GET",
                  headers: {
                    "X-Dme-Plant": controller.getPlant(),
                  },
                  data: params,
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
  
  
            });
          },
          /**
           * Ajax get request to get the data from microservice
           * @param {string} api 
           * @param {object} [data] 
           * @param {object} [headers] 
           * @returns 
           */
          getmsData: function (api, data, headers = {}) {
            return new Promise((resolve, reject) => {
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxGetRequest(
                  api,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: getmsDataUrl(api),
                  method: "GET",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  headers: {
                    "X-Dme-Plant": controller.getPlant(),
                    ...headers
                  },
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  }
                });
              }
            });
          },
          /**
           * Make an AJAX POST request with the given parameters and return a Promise.
           * @param {string} api - API endpoint, e.g., 'sfc/v1/startSfc'.
           * @param {object} data - Body of the AJAX request, pass it as an object.
           * @param {object} [headers={}] - (Optional) Additional headers as an object.
           * @param {object} [params={}] - (Optional) Additional query parameters as an object.
           * @returns {Promise<object>} A Promise containing the response object.
           * @example
           * // Example usage:
           * this.post('sfc/v1/startSfc', 
           *    { sfc: '100212', plant: 'AAAFTS' },
           *    { 'Accept': '/' },
           *    { queryParam1: 'some query param' }
           *  ).then(response => {
           *   // Handle the response here
           *  }).catch(error => {
           *   // Handle any errors here
           * });
           */
          post: function (api, data, headers = {}, params = {}) {
            return new Promise((resolve, reject) => {
              let paramsString = (Object.keys(params).length > 0) ? "?" + $.param(params) : "";
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxPostRequest(
                  this.getApiUrl(api) + paramsString,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: this.getApiUrl(api) + paramsString,
                  method: "POST",
                  dataType: "json",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  headers: {
                    "X-Dme-Plant": getPlant(),
                    ...headers
                  },
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
            });
          },
          patch: function (api, data, headers = {}, params = {}) {
            return new Promise((resolve, reject) => {
              let paramsString = "?" + $.param(params)
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxPatchRequest(
                  this.getApiUrl(api) + paramsString,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: this.getApiUrl(api),
                  method: "PATCH",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  headers: {
                    "X-Dme-Plant": getPlant(),
                    ...headers
                  },
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
            });
          },
          postoData: function (api, data, headers = {}, params = {}) {
            return new Promise((resolve, reject) => {
              let paramsString = "?" + $.param(params)
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxPostRequest(
                  api + paramsString,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: getoDataUrl(api) + paramsString,
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  headers: {
                    "X-Dme-Plant": getPlant(),
                    ...headers
                  },
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
            });
          },
          put: function (api, data, headers = {}, params = {}) {
            return new Promise((resolve, reject) => {
              let paramsString = "?" + $.param(params)
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxPutRequest(
                  this.getApiUrl(api) + paramsString,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: this.getApiUrl(api) + paramsString,
                  method: "PUT",
                  contentType: "application/json",
                  headers: {
                    "X-Dme-Plant": getPlant(),
                    ...headers
                  },
                  data: JSON.stringify(data),
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
            });
          },
          putoData: function (api, data, headers = {}, params = {}) {
            return new Promise((resolve, reject) => {
              let paramsString = "?" + $.param(params)
              if (this.getPodController()) {
                this.getPodController()._oPodController.ajaxPutRequest(
                  api + paramsString,
                  data,
                  function (oResponseData) {
                    resolve(oResponseData);
                  },
                  function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    console.log(err);
                    reject(err);
                  }
                );
              } else {
                $.ajax({
                  url: this.getoDataUrl(api) + paramsString,
                  method: "PUT",
                  contentType: "application/json",
                  headers: {
                    "X-Dme-Plant": getPlant(),
                    ...headers
                  },
                  data: JSON.stringify(data),
                  success: resolve,
                  error: (oError) => {
                    reject((oError && oError.responseJSON) || oError)
                  },
                });
              }
            });
          },
          getApiUrl: function (endPoint) {
            if (!this.getPublicApiRestDataSourceUri()) {
              return "/api/" + endPoint;
            }
            return this.getPublicApiRestDataSourceUri() + endPoint;
          },
          getoDataUrl: function (endPoint) {
            if (!this.getPodController()) {
              return "/oData" + endPoint;
            }
            return endPoint;
          },
          getmsDataUrl: function (endPoint) {
            if (!this.getPodController()) {
              return "/ms" + endPoint;
            }
            return endPoint;
          },
          getCurrentTime: function () {
            return moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          },
          /**
           * returns the i18n translated text
           * @param {string} sText 
           * @param {object} [aParams=[]] 
           * @returns 
           */
          getTranslatedText: function (sText, aParams = []) {
            return this.getView().getModel('i18n').getResourceBundle().getText(sText, aParams)
          },
          onDialogClose: function () {
            this._oDialog.close(); // ✅ Close the dialog
        }
	});
});