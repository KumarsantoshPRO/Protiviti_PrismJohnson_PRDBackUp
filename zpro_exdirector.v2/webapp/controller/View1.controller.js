
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zpj/pro/sd/sk/zproexdirector/model/formatter",
    'sap/m/MessageBox',
    "sap/ui/model/Sorter",
    "sap/ui/core/Element",
    // "sap/m/table/columnmenu/MenuBase",
    // "sap/m/table/columnmenu/Menu",
    // "sap/m/table/columnmenu/QuickSort",
    // "sap/m/table/columnmenu/QuickSortItem",
    // "sap/m/Menu",
    // "sap/m/MenuItem"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, MessageBox, Sorter, Element, MenuBase, ColumnMenu, QuickSort, QuickSortItem, Menu, MenuItem) {
        "use strict"; 
        // Start: Sort001
        /**
         * Constructor for a new Menu adapter that implements the IColumnHeaderMenu interface.
         */
        // var CustomMenuAdapter = MenuBase.extend("MenuToColumnMenuAdapter", {
        //     metadata: {
        //         aggregations: {
        //             menu: { type: "sap.m.Menu", multiple: false }
        //         }
        //     }
        // });

        /**
         * Opens the menu at the specific target element.
         *
         * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement where the menu is placed.
         */
        // CustomMenuAdapter.prototype.openBy = function (oAnchor) {
        //     const oMenu = this.getMenu();
        //     const fnResetBlocked = () => {
        //         if (this._blocked) {
        //             clearTimeout(this._blocked);
        //             this._blocked = null;
        //         }
        //     };

        //     if (!oMenu || ((this.isOpen() || this._blocked) && oAnchor === this._oIsOpenBy)) {
        //         fnResetBlocked();
        //         return;
        //     }

        //     fnResetBlocked();

        //     var oControl = oAnchor;
        //     if (!(oAnchor instanceof Element)) {
        //         oControl = Element.closestTo(oAnchor, true);
        //     }

        //     if (!this.fireBeforeOpen({ openBy: oControl })) {
        //         return;
        //     }

        //     // On click outside the menu, the sap.m.Menu closes automatically
        //     // to prevent reopening on column header click, we need to block the openBy call for a short time (200ms)
        //     oMenu.attachEventOnce("closed", () => {
        //         fnResetBlocked();
        //         this._blocked = setTimeout(fnResetBlocked, 200);
        //         this.fireAfterClose();
        //     });

        //     oMenu.openBy(oAnchor);
        //     this._oIsOpenBy = oAnchor;
        // };

        /**
         * Determines whether the menu is open.
         *
         * @returns {boolean} Whether the menu is open.
         */
        // CustomMenuAdapter.prototype.isOpen = function () {
        //     return this.getMenu()?.isOpen() || false;
        // };

        /**
         * Closes the menu.
         */
        // CustomMenuAdapter.prototype.close = function () {
        //     this.getMenu()?.close();
        // };

        /**
         * Returns the type of the menu.
         *
         * @returns {sap.ui.core.aria.HasPopup} Type of the menu
         * @public
         */
        // CustomMenuAdapter.prototype.getAriaHasPopupType = function () {
        //     return "Menu";
        // };
        // End: Sort001
        return Controller.extend("zpj.pro.sd.sk.zproexdirector.controller.View1", {
            formatter: formatter,
            onInit: function () {
                this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
                // Start: Sort001
                // this.createHeaderMenus();
                // End: Sort001
            },
            _onRouteMatched: function (oEvent) {

                var sID = oEvent.getParameter("arguments").ID;
                if (sID === "Page1" || sID === undefined || sID === "") {
                    this.onFilterBarClear();
                    this.onSearch();
                }
            },
            _getRequestData: function (sStatusText, sForWhat) {

                var aFilter = [];
                var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sStatusText)], false);
                aFilter.push(oFilter);
                var sPath = "/ET_ZDI_TP_BILLSet"
                if (this.sVkbur) {
                    var n = new sap.ui.model.Filter([new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, this.sVkbur)], false);
                    aFilter.push(n);
                }
                this.getView().setBusy(true);
                this.getView().getModel().read(sPath, {
                    filters: aFilter,
                    success: function (Data) {
                        var aFilter = [];

                        this.getView().setBusy(false);
                        if (sForWhat === "count") {
                            switch (sStatusText) {
                                case "":
                                    this.getView().getModel("count").getData().Total = Data.results.length;
                                    break;
                                case "P":

                                    this.getView().getModel("count").getData().Pending = Data.results.length;
                                    break;
                                case "D":
                                    this.getView().getModel("count").getData().Delayed = Data.results.length;
                                    break;
                                case "A":
                                    this.getView().getModel("count").getData().Approved = Data.results.length;
                                    break;
                                case "R":
                                    this.getView().getModel("count").getData().Rejected = Data.results.length;
                                    break;
                                case "DL":
                                    this.getView().getModel("count").getData().Deleted = Data.results.length;
                                    break;
                                default:

                                    break;
                            }
                        } else {
                            var dataTableModel = Data.results;
                            this.getView().setModel(new JSONModel(dataTableModel), "JSONModelForTable");
                        }
                        this.getView().getModel("count").refresh(true);


                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message, {
                            actions: [sap.m.MessageBox.Action.OK],
                            onClose: function (oAction) {

                            }
                        });
                    }.bind(this)
                });

            },
            onSearch: function () {
                this.sVkbur = this.getView().byId("id.SalesOffice.Input").getValue();
                {
                    this._getRequestData("P", "count");
                    this._getRequestData("A", "count");
                    this._getRequestData("R", "count");
                    this._getRequestData("DL", "count");
                    this._getRequestData("", "count");
                    this._getRequestData("", "tableData");
                }
            },
            onFilterBarClear: function () {
                this.getView().byId("id.SalesOffice.Input").setValue("");
            },
            _onFilterSelect: function (oEvent) {

                var sKey = oEvent.getParameter("key");
                if (sKey === "All") {
                    this._getRequestData("", "tableData");
                } else if (sKey === "Pending") {
                    this._getRequestData("P", "tableData");
                }
                else if (sKey === "Approved") {
                    this._getRequestData("A", "tableData");
                }
                else if (sKey === "Delayed") {
                    this._getRequestData("D", "tableData");
                } else if (sKey === "Rejected") {
                    this._getRequestData("R", "tableData");
                } else if (sKey === "Deleted") {
                    this._getRequestData("DL", "tableData");
                }
                //  else if (sKey === "Forwarded") {
                //     this.getForwardedData();
                // } else if (sKey === "BP") {
                //     this.getBPData();
                // } else if (sKey === "Frieght") {
                //     this.getFrieghtData();
                // }

            },
            onOrderNumber: function (oEvent) {
                var vValue = oEvent.getParameter('value');
                var filter = new sap.ui.model.Filter({
                    path: 'Pafno',
                    operator: sap.ui.model.FilterOperator.Contains,
                    value1: vValue
                });
                var oTable = this.getView().byId("productsTable");

                oTable.getBinding("items").filter(filter);
                oTable.setShowOverlay(false);

            },
            onClickofItem: function (oEvent) {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.navTo("page2",
                    {
                        pafID: oEvent.getSource().getCells()[0].getText()
                    });
                //this.oRouter.navTo("page2");
            },


            onSalesOfficeHelp: function () {
                if (!this.SalesOfficerag) {
                    this.SalesOfficerag = sap.ui.xmlfragment("zpj.pro.sd.sk.zproexdirector.view.fragments.View1.salesOfficeF4", this);
                    this.getView().addDependent(this.SalesOfficerag);
                    this._SalesOfficeTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();
                    this._oTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();
                }
                var aFilter = [];

                var oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                var oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, "")], false);
                var oFilterDomname2 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
                aFilter.push(oFilterDomname);
                aFilter.push(oFilterDomname1);
                aFilter.push(oFilterDomname2);

                sap.ui.getCore().byId("idSDSalesOfficeF4").bindAggregation("items", {
                    path: "/ET_VALUE_HELPSSet",
                    filters: aFilter,
                    template: this._SalesOfficeTemp
                });
                this.SalesOfficerag.open();
            },
            onValueHelpSearch: function (oEvent) {

                var aFilter = [];
                var sValue = oEvent.getParameter("value");
                var sPath = "/ET_VALUE_HELPSSet";
                var oSelectDialog = sap.ui.getCore().byId(oEvent.getParameter('id'));
                var oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                var oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, sValue)], false);

                aFilter.push(oFilterDomname);
                aFilter.push(oFilterDomname1);
                oSelectDialog.bindAggregation("items", {
                    path: sPath,
                    filters: aFilter,
                    template: this._oTemp
                });

            },
            onValueHelpConfirm: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem");
                var sSelectedValue = oSelectedItem.getProperty("title");
                this.byId(sap.ui.core.Fragment.createId("id.tableProductDetails.Fragment", "id.SalesOffice.Input")).setValue(sSelectedValue);
                // this.getView().byId("id.SalesOffice.Input").setValue(sSelectedValue);
            },
            // Submit action - Sales Office
            onSalesOfficeInputSubmit: function (oEvent) {
                var sTerm = oEvent.getParameter("value"),
                    aFilters = [],
                    oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false),
                    oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, sTerm)], false),
                    sValue1 = "/Vkbur",
                    sValue2 = "",
                    sMessage = "Entered Sales Office is wrong";
                aFilters.push(oFilterDomname);
                aFilters.push(oFilterDomname1);
                // aFilters.push(oFilterDomname2);
                // this._submitCall(sTerm, aFilters, sValue1, sValue2, sMessage);
            },
            onSuggest: function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue"),
                    aFilters = [],
                    sPath = "/ET_VALUE_HELPSSet",
                    oFilterDomname,
                    oFilterDomname1,
                    oFilterDomname2;
                if (sTerm.includes(",")) {
                    var nItems = sTerm.split(",").length;
                    sTerm = sTerm.split(",")[sTerm.split(",").length - 1];
                }
                oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, sTerm)], false);
                oFilterDomname2 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
                aFilters.push(oFilterDomname);
                aFilters.push(oFilterDomname2);
                aFilters.push(oFilterDomname1);

                if (sTerm) {
                    this.getView().setBusy(true);
                    this.getView().getModel().read(sPath, {
                        filters: aFilters,
                        success: function (Data) {

                            if (Data.results.length > 0) {
                                var JSONModelForSuggest = new JSONModel(Data.results);
                                this.getView().setModel(JSONModelForSuggest, "JSONModelForSuggest");
                                this.getView().getModel("JSONModelForSuggest").refresh(true);
                            }
                            this.getView().setBusy(false);
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message, {
                                actions: [sap.m.MessageBox.Action.OK],
                                onClose: function (oAction) {

                                }
                            });
                        }.bind(this)
                    });

                }
            },

            // Start: Sales Office
            onSalesOfficeHelp: function () {
                if (!this.SalesOfficerag) {
                    this.SalesOfficerag = sap.ui.xmlfragment("zpj.pro.sd.sk.zproexdirector.view.fragments.View1.salesOfficeF4", this);
                    this.getView().addDependent(this.SalesOfficerag);
                    this._SalesOfficeTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();
                    this._oTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();

                    var sServicelUrl = "/sap/opu/odata/sap/ZCUSTOMER_AUTOMATIONDISCOUNT_SRV/";
                    var oODataModel = new sap.ui.model.odata.v2.ODataModel(sServicelUrl);
                    this.SalesOfficerag.setModel(oODataModel);
                }
                var aFilter = [];

                var oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                var oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, "")], false);
                var oFilterDomname2 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
                aFilter.push(oFilterDomname);
                aFilter.push(oFilterDomname1);
                aFilter.push(oFilterDomname2);



                sap.ui.getCore().byId("idSDSalesOfficeF4").bindAggregation("items", {
                    path: "/ET_VALUE_HELPSSet",
                    filters: aFilter,
                    template: this._SalesOfficeTemp
                });
                this.SalesOfficerag.open();
            },
            onValueHelpSearch: function (oEvent) {

                var aFilter = [];
                var sValue = oEvent.getParameter("value");
                var sPath = "/ET_VALUE_HELPSSet";
                var oSelectDialog = sap.ui.getCore().byId(oEvent.getParameter('id'));
                var oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                var oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, sValue)], false);

                aFilter.push(oFilterDomname);
                aFilter.push(oFilterDomname1);
                oSelectDialog.bindAggregation("items", {
                    path: sPath,
                    filters: aFilter,
                    template: this._oTemp
                });

            },
            onValueHelpConfirm: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var sSelectedValue = oSelectedItem.getProperty("title");
                this.getView().byId("id.SalesOffice.Input").setValue(sSelectedValue);
            },
            onSuggest: function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue"),
                    aFilters = [],
                    sPath = "/ET_VALUE_HELPSSet",
                    oFilterDomname,
                    oFilterDomname1,
                    oFilterDomname2;
                if (sTerm.includes(",")) {
                    var nItems = sTerm.split(",").length;
                    sTerm = sTerm.split(",")[sTerm.split(",").length - 1];
                }
                oFilterDomname = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
                oFilterDomname1 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, sTerm)], false);
                oFilterDomname2 = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
                aFilters.push(oFilterDomname);
                aFilters.push(oFilterDomname2);
                aFilters.push(oFilterDomname1);

                if (sTerm) {
                    this.getView().setBusy(true);
                    var sServicelUrl = "/sap/opu/odata/sap/ZCUSTOMER_AUTOMATIONDISCOUNT_SRV/";
                    var oODataModel = new sap.ui.model.odata.v2.ODataModel(sServicelUrl);
                    oODataModel.read(sPath, {
                        filters: aFilters,
                        success: function (Data) {

                            if (Data.results.length > 0) {
                                var JSONModelForSuggest = new JSONModel(Data.results);
                                this.getView().setModel(JSONModelForSuggest, "JSONModelForSuggest");
                                this.getView().getModel("JSONModelForSuggest").refresh(true);
                            }
                            this.getView().setBusy(false);
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message, {
                                actions: [sap.m.MessageBox.Action.OK],
                                onClose: function (oAction) {

                                }
                            });
                        }.bind(this)
                    });

                }
            },
            // Start: Sort001
            createHeaderMenus: function () {
                const oTable = this.getView().byId("productsTable");
                const aColumns = oTable.getColumns();
                const oColumnPAFNo = aColumns[0];
                const oColumnSO = aColumns[2];
                const oColumnCustname = aColumns[3];
                const oColumnCustid = aColumns[4];
                const oColumnReqDate = aColumns[8];
                const oColumnValidity = aColumns[9];

                oColumnPAFNo.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Pafno",
                                label: "Pafno"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Pafno", false)]);
                                    oColumnPAFNo.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Pafno", true)]);
                                    oColumnPAFNo.setSortIndicator("Descending");

                                } else {
                                    oColumnPAFNo.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));
                oColumnSO.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Soname",
                                label: "Soname"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Soname", false)]);
                                    oColumnSO.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Soname", true)]);
                                    oColumnSO.setSortIndicator("Descending");

                                } else {
                                    oColumnSO.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));
                oColumnCustname.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Name",
                                label: "Name"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Name", false)]);
                                    oColumnCustname.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Name", true)]);
                                    oColumnCustname.setSortIndicator("Descending");

                                } else {
                                    oColumnCustname.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));
                oColumnCustid.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Kunnr",
                                label: "Kunnr"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Kunnr", false)]);
                                    oColumnCustid.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Kunnr", true)]);
                                    oColumnCustid.setSortIndicator("Descending");

                                } else {
                                    oColumnCustid.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));
                oColumnReqDate.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Erdat",
                                label: "Erdat"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Erdat", false)]);
                                    oColumnReqDate.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Erdat", true)]);
                                    oColumnReqDate.setSortIndicator("Descending");

                                } else {
                                    oColumnReqDate.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));
                oColumnValidity.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Validity",
                                label: "Validity"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Validity", false)]);
                                    oColumnValidity.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Validity", true)]);
                                    oColumnValidity.setSortIndicator("Descending");

                                } else {
                                    oColumnValidity.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));

            }
            // End: Sort001

        });
    });

