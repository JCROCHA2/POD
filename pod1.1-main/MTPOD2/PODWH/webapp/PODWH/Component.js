sap.ui.define([
	"sap/dm/dme/podfoundation/component/production/ProductionUIComponent",
	"sap/ui/Device"
], function (ProductionUIComponent, Device) {
	"use strict";

	return ProductionUIComponent.extend("mt.custom.plugin.PODWH.PODWH.Component", {
		metadata: {
			manifest: "json"
		}
	});
});