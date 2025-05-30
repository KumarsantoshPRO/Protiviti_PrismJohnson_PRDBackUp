sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "pj/zpurchasemanager/model/formatter",
    "sap/m/MessageBox",
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
    function (Controller,
        JSONModel,
        formatter,
        MessageBox, Sorter, Element, MenuBase, ColumnMenu, QuickSort, QuickSortItem, Menu, MenuItem) {
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
        return Controller.extend("pj.zpurchasemanager.controller.View1", {
            formatter: formatter,
            onInit: function () {
                this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
                // Start: Sort001
                // this.createHeaderMenus();
                // End: Sort001
            },

            _onRouteMatched: function (oEvent) {
                var sID = oEvent.getParameter("arguments").ID;
                var oEditFlag = {
                    "Editable": false
                }
                var oModelEditFlag = new JSONModel(oEditFlag);
                this.getView().setModel(oModelEditFlag, "modelEditFlag");
                if (sID === "null" || sID === undefined) {
                    // this.byId(sap.ui.core.Fragment.createId("id.tableProductDetails.Fragment", "id.main.IconTabBar")).setSelectedKey("All");
                    var dataCount = this.getOwnerComponent().getModel("count").getData().count;
                    this.getView().setModel(new JSONModel(dataCount), "count");

                    this._getRequestData("", "count");
                    this._getRequestData("P", "count");
                    this._getRequestData("A", "count");
                    this._getRequestData("R", "count");
                    // this._getRequestData("D", "count");
                    this._getRequestData("", "tableData");


                }
            },
            onOrderNumber: function (oEvent) {
                var vValue = oEvent.getParameter('value');
                var filter = new sap.ui.model.Filter({
                    path: 'Paf',
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
                        ID: oEvent.getSource().getCells()[0].getText()
                    });

            },
            _getRequestData: function (sStatusText, sForWhat) {
                var aFilter = [];
                var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sStatusText)], false);
                aFilter.push(oFilter);
                var sPath = "/ET_ZDI_TP_BILLSet"
                var that = this;
                this.getView().setBusy(true);
                this.getView().getModel().read(sPath, {
                    filters: aFilter,
                    success: function (Data) {
                        that.getView().setBusy(false);
                        if (sForWhat === "count") {
                            if (sStatusText === 'P') {
                                that.aDelayedData = [];
                                that.aPendingData = [];
                                for (var i = 0; i < Data.results.length; i++) {
                                    var obj = Data.results[i];
                                    for (var key in obj) {

                                        if (obj['Requestdate']) {
                                            if (key === 'Status') {
                                                if (obj['Status'] === 'P') {
                                                    var today = new Date();
                                                    if (Math.floor((today - obj['Requestdate']) / (1000 * 3600 * 24)) > 10) {
                                                        obj['Status'] = 'D';
                                                        that.aDelayedData.push(obj);
                                                    } else {
                                                        that.aPendingData.push(obj);
                                                    }

                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            switch (sStatusText) {
                                case "":
                                    that.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                                    that.getView().getModel("count").getData().Total = Data.results.length;
                                    break;
                                case "P":
                                    that.getView().getModel("modelEditFlag").setProperty("/Editable", true);

                                    that.getView().getModel("count").getData().onGoing = that.aPendingData.length;
                                    that.getView().getModel("count").getData().Delayed = that.aDelayedData.length;
                                    break;
                                case "A":
                                    that.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                                    that.getView().getModel("count").getData().Approved = Data.results.length;
                                    break;
                                case "R":
                                    that.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                                    that.getView().getModel("count").getData().Rejected = Data.results.length;
                                    break;
                                case "D":

                                    that.getView().getModel("modelEditFlag").setProperty("/Editable", true);
                                    that.getView().getModel("count").getData().Delayed = that.aDelayedData.length;
                                    break;
                                default:

                                    break;
                            }
                        } else {
                            var dataTableModel;
                            if (sForWhat === 'tableData' && sStatusText === 'P') {
                                dataTableModel = that.aPendingData;
                            } else if (sForWhat === 'tableData' && sStatusText === 'D') {
                                dataTableModel = that.aDelayedData;
                            } else {
                                dataTableModel = Data.results;
                            }

                            that.getView().setModel(new JSONModel(dataTableModel), "ModelForTable");
                        }
                        that.getView().getModel("count").refresh(true);


                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message, {
                            actions: [sap.m.MessageBox.Action.OK],
                            onClose: function (oAction) {

                            }
                        });
                    }
                });

            },
            onFilterSelect: function (oEvent) {
                // this.byId(sap.ui.core.Fragment.createId("id.tableProductDetails.Fragment", "id.orderNumber.Input")).setValue("");
                var sKey = oEvent.getParameter("key");
                if (sKey === "All") {
                    this._getRequestData("", "tableData");
                    this.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                }
                else if (sKey === "Delay") {
                    this._getRequestData("D", "tableData");
                    this.getView().getModel("modelEditFlag").setProperty("/Editable", true);
                } else if (sKey === "OnGoing") {
                    this._getRequestData("P", "tableData");
                    this.getView().getModel("modelEditFlag").setProperty("/Editable", true);
                } else if (sKey === "Approved") {
                    this._getRequestData("A", "tableData");
                    this.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                } else if (sKey === "Rejected") {
                    this._getRequestData("R", "tableData");
                    this.getView().getModel("modelEditFlag").setProperty("/Editable", false);
                }

            },
            // Start: Sort001
            createHeaderMenus: function () {
                const oTable = this.getView().byId("productsTable");
                const aColumns = oTable.getColumns();
                const oColumnPAFNo = aColumns[0];
                const oColumnSO = aColumns[1];
                const oColumnCustname = aColumns[2];
                const oColumnCustid = aColumns[3];
                const oColumnReqDate = aColumns[6];
                // const oColumnValidity = aColumns[9];

                oColumnPAFNo.setHeaderMenu(new ColumnMenu({
                    quickActions: [
                        new QuickSort({
                            items: new QuickSortItem({
                                key: "Paf",
                                label: "Paf"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Paf", false)]);
                                    oColumnPAFNo.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Paf", true)]);
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
                                key: "Vkbur",
                                label: "Vkbur"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Vkbur", false)]);
                                    oColumnSO.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Vkbur", true)]);
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
                                key: "Requestdate",
                                label: "Requestdate"
                            }),

                            change: function (oEvent) {
                                const oBinding = oTable.getBinding("items");
                                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                                if (sSortOrder === "Ascending") {
                                    oBinding.sort([new Sorter("Requestdate", false)]);
                                    oColumnReqDate.setSortIndicator("Ascending");

                                } else if (sSortOrder === "Descending") {
                                    oBinding.sort([new Sorter("Requestdate", true)]);
                                    oColumnReqDate.setSortIndicator("Descending");

                                } else {
                                    oColumnReqDate.setSortIndicator("None");
                                }
                            }
                        })
                    ]
                }));


            }
            // End: Sort001

        });
    });
