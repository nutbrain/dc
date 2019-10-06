;
(function (window) {
    const vm = new Vue({
        el: "#app",
        data: {
            message: "ElementJS is fantastic!",
            dialogFormVisible: false,
            dialogEditVisible: false,
            newCustomer: "",
            currentEdit: null,
            good: {
                type: '',
                number: 0,
                price: 0,
                total: 0
            },
            form: {
                id: '',
                createDate: '',
                paidDate: '',
                customer: '',
                goods: [],
                amount: 0,
                receive: 0,
            },
            formLabelWidth: '120px',
            orders: [],
            startDate: new Date(),
            endDate: new Date(),
            filterCustomer: "all",
            statistics: {
                created: {},
                paid: {}
            },
        },
        created: function () {
            localforage.getItem('orders').then((orders) => {
                // 当离线仓库中的值被载入时，此处代码运行
                this.orders = orders || [];
            }).catch((err) => {
                // 当出错时，此处代码运行
                console.log(err);
            });
            // localforage.getItem('customers').then((customers) => {
            //     // 当离线仓库中的值被载入时，此处代码运行
            //     this.customers = customers || [];
            // }).catch((err) => {
            //     // 当出错时，此处代码运行
            //     console.log(err);
            // });
        },
        computed: {
            filteredOrders() {
                return this.orders
                // return this.orders.filter(function(order){
                //     return order.paidDate  && (order.paidDate>=this.startDate) && (order.paidDate<this.endDate) && (this.filterCustomer==="all" || this.filterCustomer===order.customer);
                // }.bind(this));
            },
            types() {
                var types = [];
                this.orders.forEach(order => {
                    order.goods.forEach(good => {
                        if (!types.includes(good.type)) {
                            types.push(good.type);
                        }
                    });
                });
                return types;
            },
            customers() {
                var customers = [];
                this.orders.forEach(order => {
                    if (!customers.includes(order.customer)) {
                        customers.push(order.customer);
                    }
                });
                return customers;
            },
            customersFilter() {
                return this.customers.map(function (customer) {
                    return {
                        text: customer,
                        value: customer
                    }
                })
            },
        },
        watch: {
            orders: {
                handler: function (val, oldVal) {
                    localforage.setItem('orders', val).then(function (value) {
                        // 当值被存储后，可执行其他操作
                        console.log('orders changed');
                    }).catch(function (err) {
                        // 当出错时，此处代码运行
                        console.log(err);
                    });;
                },
                deep: true
            },
        },
        methods: {
            handleShowAdd() {
                this.dialogFormVisible = true;
                this.form = {
                    id: '',
                    createDate: '',
                    paidDate: '',
                    customer: '',
                    goods: [],
                    amount: 0,
                    receive: 0,
                };
            },
            handleAddOrder() {
                this.form.id = Date.parse(new Date());
                this.form.amount = this.form.goods.reduce(function (a, b) {
                    return {
                        total: a.total + b.total
                    }
                }).total;
                console.log(this.form.amount)
                this.orders.push(this.form);
                this.form = {
                    id: '',
                    createDate: '',
                    paidDate: '',
                    customer: '',
                    goods: [],
                    amount: 0,
                    receive: 0,
                };
                this.dialogFormVisible = false;
            },
            handleDeleteOrder(i, r) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.orders.forEach((order, index) => {
                        if (order.id === r.id) {
                            this.orders.splice(index, 1);
                        }
                    });
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // handleAddCustomer() {
            //     this.customers.push(this.newCustomer);
            //     this.newCustomer = "";
            // },
            handleAddGood() {
                this.good.total = this.good.price * this.good.number;
                this.form.goods.push(this.good);
                this.good = {
                    type: '',
                    number: 0,
                    price: 0,
                    total: 0
                }
            },
            handleDelete(i, r) {
                this.form.goods.splice(i, 1);
            },
            // handleDeleteCustomer(i) {
            //     this.customers.splice(i, 1);
            // },
            handleShowEdit(i, r) {
                this.dialogEditVisible = true;
                this.currentEdit = r;
                for (const attr in this.currentEdit) {
                    if (this.currentEdit.hasOwnProperty(attr)) {
                        this.form[attr] = this.currentEdit[attr];
                    }
                }
                this.form.goods = this.currentEdit.goods.slice();
            },
            handleEditOrder() {
                this.form.amount = this.form.goods.reduce(function (a, b) {
                    return {
                        total: a.total + b.total
                    }
                }).total;
                for (const attr in this.form) {
                    if (this.form.hasOwnProperty(attr)) {
                        this.currentEdit[attr] = this.form[attr];
                    }
                }
                this.currentEdit = null;
                this.form = {
                    id: '',
                    createDate: '',
                    paidDate: '',
                    customer: '',
                    goods: [],
                    amount: 0,
                    receive: 0,
                };
                this.dialogEditVisible = false;
            },
            tableRowClassName({
                row,
                rowIndex
            }) {
                if (row.receive == 0) {
                    return 'uncomplete-row';
                } else {
                    return 'complete-row';
                }
                return '';
            },
            filterCustomers(customer, order, column) {
                return order.customer === customer
            },
            handleStatistic() {
                this.statistics.customer = this.filterCustomer;
                this.statistics.created.orders = this.orders.filter(function (order) {
                    return order.createDate && (order.createDate >= this.startDate) && (order.createDate < this.endDate) && (this.filterCustomer === "all" || this.filterCustomer === order.customer);
                }.bind(this));
                this.statistics.paid.orders = this.orders.filter(function (order) {
                    return order.paidDate && (order.paidDate >= this.startDate) && (order.paidDate < this.endDate) && (this.filterCustomer === "all" || this.filterCustomer === order.customer);
                }.bind(this));
                this.statistics.created.amount = this.statistics.created.orders.length ? this.statistics.created.orders.reduce(function (a, b) {
                    return {
                        amount: a.amount + b.amount
                    }
                }).amount : 0;
                this.statistics.paid.receive = this.statistics.paid.orders.length ? this.statistics.paid.orders.reduce(function (a, b) {
                    return {
                        receive: a.receive + b.receive
                    }
                }).receive : 0;
                alert(`在${this.startDate.toLocaleDateString()}至${this.endDate.toLocaleDateString()}内，
            客户${this.filterCustomer==="all"?"全部":this.filterCustomer},
            有${this.statistics.created.orders.length}个创建订单，
            有${this.statistics.paid.orders.length}个支付订单
            下单总额：${this.statistics.created.amount}
            实收总额：${this.statistics.paid.receive}
                `)
            }
        }
    });
    window.vm = vm;
}(window))