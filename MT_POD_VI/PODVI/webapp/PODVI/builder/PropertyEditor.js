sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/podfoundation/control/PropertyEditor"
], function (ResourceModel, PropertyEditor) {
    "use strict";
    
    var oFormContainer;

    return PropertyEditor.extend( "mt.custom.plugin.PODVI.PODVI.builder.PropertyEditor" ,{

		constructor: function(sId, mSettings){
			PropertyEditor.apply(this, arguments);
			
			this.setI18nKeyPrefix("customComponentListConfig.");
			this.setResourceBundleName("mt.custom.plugin.PODVI.PODVI.i18n.builder");
			this.setPluginResourceBundleName("mt.custom.plugin.PODVI.PODVI.i18n.i18n");
		},
		
		addPropertyEditorContent: function(oPropertyFormContainer){
			var oData = this.getPropertyData();
			
			this.addSwitch(oPropertyFormContainer, "backButtonVisible", oData);
			this.addSwitch(oPropertyFormContainer, "closeButtonVisible", oData);
						
			this.addInputField(oPropertyFormContainer, "title", oData);
			this.addInputField(oPropertyFormContainer, "text", oData);
			this.addInputField(oPropertyFormContainer, "Workcenter", oData);
			this.addInputField(oPropertyFormContainer, "DCVI", oData);
			this.addInputField(oPropertyFormContainer, "DCWeight", oData);
			this.addInputField(oPropertyFormContainer, "DCCustomer", oData);
			this.addSwitch(oPropertyFormContainer, "ViewSubstrate", oData);
			this.addSwitch(oPropertyFormContainer, "CMMFileupload", oData);


            oFormContainer = oPropertyFormContainer;
		},
		
		getDefaultPropertyData: function(){
			return {
				
				"backButtonVisible": true,
				"closeButtonVisible": true,
                "title": "PODVI",
				"text": "PODVI",
				"Workcenter": "",
				"DCVI": "",
				"DCCustomer": "",
				"DCWeight": "",
				"ViewSubstrate": false,
				"CMMFileupload": false
				

                
			};
		}

	});
});