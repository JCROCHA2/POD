sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel"

], function (jQuery, PluginViewController, JSONModel) {
	"use strict";

      
    const apis = {
        getSfcWorkList: "sfc/v1/worklist/sfcs",
        getNcDetails: "nonconformance/v1//nonconformances",
        getOrdersList: "order/v1/orders/list",
        getOrderDetails: "order/v1/orders",
        getSfcDetails: "sfc/v1/sfcdetail",
        getShifts: "shift/v1/shifts",
        getWorkCenters: "workcenter/v2/workcenters",
        getOrdersBAPI: "pe/api/v1/process/processDefinitions/start?key=REG_3bc7d509-0806-42f1-a290-5e2476bc230d&async=false",
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



	return PluginViewController.extend("mt.custom.plugin.PODPP.PODPP.controller.MainView", {
		onInit: function () {

			PluginViewController.prototype.onInit.apply(this, arguments);


            view = this.getView();

            this.getPlantDetails();
            view.setModel(this.pageModel, 'mainModel');
        
           view.setBusy(true);
           podConfigs = this._getConfiguration();
           let ppgetProcessOrder = podConfigs.ppgetprocess;
           let ppreleaseProcesOrder = podConfigs.ppreleaseprocess;


			
            var oData = {
                orders: [
                    { order: "4443791", material: "148029", size: "SML", scheduledstart: "May 1, 2025, 11:20:00PM US/Eastern", customer: "253957", scheduledcomplete: "May 2, 2025, 12:00:00AM US/Eastern", quantity: "4"},
                    { order: "4443834", material: "148029", size: "SML", scheduledstart: "May 3, 2025, 11:20:00PM US/Eastern", customer: "253957", scheduledcomplete: "May 5, 2025, 12:00:00AM US/Eastern", quantity: "8"},
                    { order: "4443842", material: "148029", size: "SML", scheduledstart: "May 1, 2025, 11:20:00PM US/Eastern", customer: "253957", scheduledcomplete: "May 5, 2025, 12:00:00AM US/Eastern", quantity: "20"},
                    { order: "4443791", material: "148029", size: "INT", scheduledstart: "May 1, 2025, 11:20:00PM US/Eastern", customer: "253957", scheduledcomplete: "May 5, 2025, 12:00:00AM US/Eastern", quantity: "4"},
                    { order: "4443874", material: "148029", size: "JMB", scheduledstart: "May 1, 2025, 11:20:00PM US/Eastern", customer: "253957", scheduledcomplete: "May 5, 2025, 12:00:00AM US/Eastern", quantity: "5"}
                    ]
            };


               // Set default date range to 2 weeks ahead
               var oCurrentDate = new Date();
               var oEndDate = new Date(oCurrentDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // Adding 14 days
               var oStartDate = new Date(oCurrentDate.getTime()); // Today's date
   
               // Set the default values for both the start and end date pickers
               this.byId("startDatePicker").setDateValue(oStartDate);
               this.byId("endDatePicker").setDateValue(oEndDate);

          let  oOrders =   this._getProcessOrders(oStartDate,oEndDate);

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            view.setBusy(false);
			           
            
		},
        _getOrderBAPI: function (startfrom, startto) {


          
            let payload = {
                
                plant: this.getPlant(),
                COMPLETEDATE: startfrom,
                STARTDATE: startto
            
            };
       
             return this.post(apis.getOrdersBAPI,payload ).then(res => {
       
                 return res
             })

        
        },


                 /********** get orders data **********/
      _getProcessOrders: async function (startfrom, startto) {


        let oOrder = await this._getOrderBAPI(startfrom, startto)    ;


        //to make it format

         this.pageModel.setProperty('/OrderList', oOrder);

        
        },





        onDateChange: function () {

             // Set the default values for both the start and end date pickers
       let      oStartdate = this.byId("startDatePicker").getDateValue();
      let       oEndDate = this.byId("endDatePicker").getDateValue();

        let    oOrders =   this._getProcessOrders(oStartdate,oEndDate);

            this._applyFilters();
        },

        onOrderSizeChange: function () {
            this._applyFilters();
        },

        _applyFilters: function () {
            var oStartDate = this.byId("startDatePicker").getDateValue();
            var oEndDate = this.byId("endDatePicker").getDateValue();

            var aSelectedSizes = [];
            if (this.byId("checkSmall").getSelected()) aSelectedSizes.push("SML");
            if (this.byId("checkIntermediate").getSelected()) aSelectedSizes.push("INT");
            if (this.byId("checkLarge").getSelected()) aSelectedSizes.push("JMB");



                  // If no date range is selected, don't apply date filters
                  var oFilterSize = new sap.ui.model.Filter({
                    filters: aSelectedSizes.map(function (sSize) {
                        return new sap.ui.model.Filter("size", sap.ui.model.FilterOperator.EQ, sSize);
                    }),
                    and: false // Or logic between size filters
                });
    
                // If no size filter is selected, don't apply size filters
                if (aSelectedSizes.length === 0) {
                    oFilterSize = null; // Reset size filter if no size is selected
                }
    
                // Combine the date and size filters
                var oCombinedFilter = new sap.ui.model.Filter({
                    filters: [oFilterSize].filter(Boolean), // Filter out null filters
                    and: true // And logic between all filters
                });
    
                // Apply the filters to the binding of the orders list
                var oList = this.getView().byId("ordersList");
                var oBinding = oList.getBinding("items");
                oBinding.filter(oCombinedFilter);

        
        },

        onReleasePress: function () {
            sap.m.MessageToast.show("Release button clicked!");
        },




        onAfterRendering: function(){
           
       
            
    

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
        },
        

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		}
	});
});