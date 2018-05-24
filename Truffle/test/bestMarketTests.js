const marketContract = artifacts.require("./../contracts/bestMarket.sol");
const tokenContract = artifacts.require("./../contracts/marketToken.sol");
const utils = require('./utils');

contract('BestMarket', function (accounts) {

    const day = 60 * 60 * 24;
    const year = day * 365;
    const fee = 5;
    const ether = '1000000000000000000';
    const halfEther = '500000000000000000';
    const registerTax = ether;


    let marketInstance;
    let tokenInstance;

    const owner = accounts[0];
    const seller = accounts[1];
    const buyer = accounts[2];

    const product1 = {
        price : ether,
        productName : "product 1",
        description : "some description 1",
        ipfsPath :  "somePath"
    }

    const product2 = {
        price : halfEther,
        productName : "product 2",
        description : "some description 2",
        ipfsPath :  "somePath"
    }


    let ownerOptions = {
        from: owner,
        //value: '1000000000000000000', 
        //gas: 100000
    };

    let sellerOptions = {
        from: seller,
    };

    let sellerPayableOptions = {
        from: seller,
        value: ether
    };


    let buyerOptions = {
        from: buyer,
    };

    let buyerPayableOptions = {
        from: buyer,
        value: ether
    };

    // run tests => 
    let deployedPureContract = false;
    let initMarketContract = false;
    let deployedTokenContract = true;

    if (deployedPureContract) {

        describe('Deploy pure market contract', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);

                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);
            });

            it("Should set owner correctly.", async function () {
                let _owner = await marketInstance.owner.call();

                assert.strictEqual(owner, _owner, "The expected owner is not set.");
            });

            it("Owner should be incorrect.", async function () {
                let _owner = await marketInstance.owner.call();

                assert.notEqual(buyer, _owner, "The expected owner should not be correct.");
            });

            it("Contract should be not initialized.", async function() {

                let result = await marketInstance.isContractInit.call();
    
                assert.equal(JSON.parse(result), false, "Contract is initialized!");
            });

            it("Market token address should be not set.", async function() {

                let result = await marketInstance.mt.call();
                
                assert.equal(result, '0x0000000000000000000000000000000000000000', "Market token address is set!");
            });

            it("Buyer and seller count should be 0.", async function() {

                let sellers = await marketInstance.numOfSellers.call();
                let buyers = await marketInstance.numOfBuyers.call();
                
                assert.equal(JSON.parse(sellers), 0, "There are some sellers!");
                assert.equal(JSON.parse(buyers), 0, "There are some buyers!");
            });

            it("Should not have registered sellers", async function() {

                let result = await marketInstance.userIsSeller(sellerOptions);
                let result1 = await marketInstance.userIsSeller(buyerOptions);
                let result2 = await marketInstance.userIsSeller(ownerOptions);
    
                assert.equal(JSON.parse(result), false, "User should be not a seller!");
                assert.equal(JSON.parse(result1), false, "User should be not a seller!");
                assert.equal(JSON.parse(result2), false, "User should be not a seller!");
            });
    
            it("Should not have registered buyers", async function() {
    
                let result = await marketInstance.userIsBuyer(buyerOptions);
                let result1 = await marketInstance.userIsBuyer(sellerOptions);
                let result2 = await marketInstance.userIsBuyer(ownerOptions);
    
                assert.equal(JSON.parse(result), false, "User should be not a buyer!");
                assert.equal(JSON.parse(result1), false, "User should be not a buyer!");
                assert.equal(JSON.parse(result2), false, "User should be not a buyer!");
            });
    
            it("Should not have inserted products", async function() {
    
                let result = await marketInstance.getNumberOfProducts();
    
                assert.equal(JSON.parse(result), 0, "The expected products count are not equal!");
            });

            it("Should throw exception when call a func(registerAsSeller) before initialize.", async function() {
    
                try {
                    await marketInstance.registerAsSeller(sellerPayableOptions);
                    assert.isTrue(false, 'Register as seller pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(registerAsBuyer) before initialize.", async function() {
    
                try {
                    await marketInstance.registerAsBuyer(buyerPayableOptions);
                    assert.isTrue(false, 'Register as buyer pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(addProduct) before initialize.", async function() {
    
                try {
                    await marketInstance.addProduct(product1.price, 
                                                    product1.productName, 
                                                    product1.description, 
                                                    product1.ipfsPath, 
                                                    sellerOptions);

                    assert.isTrue(false, 'addProduct pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(buyProduct) before initialize.", async function() {
    
                try {
                    await marketInstance.buyProduct(product1.productName,
                                                    buyerOptions);
                                                    
                    assert.isTrue(false, 'buyProduct pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            // it("Owner try withdraw funds. Should throw exception. Balance is 0.", async function () {

            //     try {
            //         await marketInstance.withdraw(ownerOptions);
            //         assert.isTrue(false, 'Successfully withdraw some funds!');
            //     } catch (e) {
            //         assert.isTrue(true);
            //     }
            // });

            // it("Get price of long name. Should return 0.5 ether. domain name length range is greater than 15 inclusive!", async function () {

            //     let price = await marketInstance.getPrice('domainaleksaleks');

            //     assert.equal(toEthers(0.5), JSON.parse(price), 'Price does not match!');
            // });
        });

    }

    if(initMarketContract){
        describe('Init contract', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);

                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);

                await marketInstance.init(tokenInstance.address, ownerOptions);
            });


            it("Contract should be initialized.", async function() {
                
                let result = await marketInstance.isContractInit.call();

                assert.equal(JSON.parse(result), true, "Contract is not initialized!");
            });

            it("Market token address should be correct.", async function() {

                let result = await marketInstance.mt.call();
                
                assert.equal(result, tokenInstance.address, "Market token address is incorrect!");
            });

            it(`Register tax should be ${registerTax}.`, async function() {

                let result = await marketInstance.registerTax.call();
                
                assert.equal(result, registerTax, "Register tax is incorrect!");
            });

            it(`Contract fee should be ${fee}.`, async function() {

                let result = await marketInstance.fee.call();
                
                assert.equal(JSON.parse(result), fee, "Contract fee is incorrect!");
            });
        });
    }

    if(deployedTokenContract){
        describe('Deploy Market token contract', () => {
            beforeEach(async function () {
                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);
            });

            it("Should set owner correctly.", async function () {
                let tokenName = await tokenInstance.name.call();
                let tokenSymbol = await tokenInstance.symbol.call();
                let tokenDecimals = await tokenInstance.decimals.call();


                assert.strictEqual(tokenName, "Market Token", "The expected owner is not set.");
                assert.strictEqual(tokenSymbol, "MT", "The expected owner is not set.");
                assert.strictEqual(JSON.parse(tokenDecimals), 18, "The expected owner is not set.");
            });

            it("Client can buy tokens.", async function () {

                let data = await tokenInstance.buyTokens(sellerPayableOptions);

                //console.log(data.logs[0].args.value);

                assert.equal(JSON.parse(data.logs[0].args.value), sellerPayableOptions.value, "Client cannot buy tokens.");
            });

            it("Client can not buy tokens more than total supply.", async function () {

                 try {
                    sellerPayableOptions.value = '1000000000000000000001';
                    let boughtTokens = await tokenInstance.buyTokens(sellerPayableOptions);
                    sellerPayableOptions.value = ether;
                    assert.isTrue(false, 'Client bought tokens.')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Client can not buy tokens after closing time.", async function () {

                await utils.timeTravel(web3, year);

                sellerPayableOptions.value = ether;

                try {
                    let data = await tokenInstance.buyTokens(sellerPayableOptions);
                    assert.isTrue(false, 'Client can buy tokens.')
                } catch (e) {
                    assert.isTrue(true);
                }
            });
        });
    }

    // if (registerDomainTests) {

    //     describe('On domain register. For all TIME TRAVEL test you should start TRUFFLE!', () => {
    //         beforeEach(async function () {
    //             marketInstance = await ddns.new({
    //                 from: owner
    //             });
    //         });

    //         it("Should register domain correctly for 1 ether.", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let isExist = await marketInstance.isDomainRegister(domainName);

    //             assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
    //         });

    //         it("Should register domain correctly for 0.8 ether.", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //             let isExist = await marketInstance.isDomainRegister(domainName);

    //             assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
    //         });

    //         it("Should register domain correctly for 0.5 ether.", async function () {

    //             let domainName = 'hello_hello_hello';

    //             userOptions.value = toEthers(0.5);

    //             await marketInstance.register(domainName, ipToHex(ip3), userOptions);

    //             let isExist = await marketInstance.isDomainRegister(domainName);

    //             assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
    //         });

    //         it("Should throw exception when you try to register domain with higher price. Current price is 0.5", async function () {

    //             let domainName = 'hello_hello_hello';

    //             userOptions.value = toEthers(0.7);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Should throw exception when you try to register domain with lower price. Current price is 0.5", async function () {

    //             let domainName = 'hello_hello_hello';

    //             userOptions.value = toEthers(0.3);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Should throw exception when you try to register domain with higher price. Current price is 0.8", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(2);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Should throw exception when you try to register domain with lower price. Current price is 0.8", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.3);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Should throw exception when you try to register domain with higher price. Current price is 1", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(2);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Should throw exception when you try to register domain with lower price. Current price is 1", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(0.95);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip3), userOptions);
    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }

    //         });

    //         it("Register domain correctly, another domain should not exist", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //             let isExist = await marketInstance.isDomainRegister('some domain');

    //             assert.equal(false, JSON.parse(isExist), "The expected owner is not set");
    //         });

    //         it("Try register domain twice. Different users. Should throw exception!", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             try {
    //                 secondUserOptions.value = toEthers(1);
    //                 await marketInstance.register(domainName, ipToHex(ip2), secondUserOptions);

    //                 assert.isTrue(false, 'Domain is registered twice!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }
    //         });

    //         it("Try register domain twice. Same user. Should throw exception!", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //                 assert.isTrue(false, 'Domain is registered twice!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }
    //         });

    //         it("Try register domain with short name. Should throw exception!", async function () {

    //             let domainName = 'hell';

    //             userOptions.value = toEthers(1);

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 //await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }
    //         });

    //         it("Try register domain with long name. Should throw exception!", async function () {

    //             let domainName = '0123456789aleks0123456789aleks0123456789aleks0123456789aleks';

    //             userOptions.value = toEthers(1);

                

    //             try {
    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 //await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //                 assert.isTrue(false, 'Domain is registered!')
    //             } catch (e) {
    //                 assert.isTrue(true);
    //             }
    //         });

    //         it("Register domain twice. Time span 1 year + 2 day. Different users. Should register!", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             try {

    //                 await utils.timeTravel(web3, year + (day * 2));

    //                 secondUserOptions.value = toEthers(1);
    //                 await marketInstance.register(domainName, ipToHex(ip2), secondUserOptions);

    //                 assert.isTrue(true)
    //             } catch (e) {

    //                 assert.isTrue(false, 'Domain cant be registered!');
    //             }
    //         });

    //         it("Register domain twice. Time span 1 year + 1 day. Same user. Should register!", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             try {

    //                 await utils.timeTravel(web3, year + day);

    //                 await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //                 assert.isTrue(true)
    //             } catch (e) {

    //                 assert.isTrue(false, 'Domain cant be registered!');
    //             }
    //         });

    //         it("Register Nth unique domains, count should match", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             let numOfDomains = getRandomInt(2, 10);

    //             for (let i = 0; i < numOfDomains; i++) {

    //                 let ipIndex = getRandomInt(0, 3);
    //                 await marketInstance.register(domainName + '_' + i, ipToHex(ips[ipIndex]), userOptions);
    //             }

    //             let uniqueDomainCount = await marketInstance.getDomainCount({
    //                 from: _user
    //             });

    //             assert.equal(numOfDomains, JSON.parse(uniqueDomainCount), "Count does not match!");
    //         });

    //         it("Register unique domain twice. Time span 1 year + 1 day. Same user. Count should be 1 !", async function () {

    //             let domainName = 'hello';

    //             userOptions.value = toEthers(1);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             await utils.timeTravel(web3, year + day);
    //             await marketInstance.register(domainName, ipToHex(ip2), userOptions);

    //             let uniqueDomainCount = await marketInstance.getDomainCount({
    //                 from: _user
    //             });

    //             assert.equal(1, JSON.parse(uniqueDomainCount), "Count does not match!");
    //         });

    //         it("Check IP address of registered domain. Should match", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             // '101.203.1.56'
    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let ip = await marketInstance.getIP(domainName, {
    //                 from: _user
    //             });

    //             //console.log(ip);
    //             ip = hex2ip(ip);

    //             assert.equal(ip, ip1, "Invalid IP address");
    //         });

    //         it("Check owner of registered domain. Should match", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let domainOwner = await marketInstance.getDomainOwner(domainName, {
    //                 from: _user2
    //             });

    //             assert.equal(_user, domainOwner, "Owner do not match!");
    //         });

    //         it("Check owner of registered domain. Should NOT match", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let domainOwner = await marketInstance.getDomainOwner(domainName, {
    //                 from: _user2
    //             });

    //             assert.notEqual(_user, _user2, "Owner do not match!");
    //         });

    //         it("Get domain receipt.", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                 from: _user
    //             });

    //             //console.log(result[0].length);
    //             //console.log(JSON.parse(result[0][0]))
    //             //console.log(JSON.parse(result[1][0]))
    //             //console.log(JSON.parse(result[2][0]))

    //             let numOfReceipt = result[0].length;

    //             assert.equal(1, numOfReceipt, "Number of receipt does not match!");
    //         });

    //         it("Try get domain receipt. USer do not own domain!", async function () {

    //             let domainName = 'hello_hello';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //             let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                 from: _user2
    //             });

    //             let numOfReceipt = result[0].length;

    //             assert.equal(0, numOfReceipt, "Number of receipt does not match!");
    //         });

    //         it("Get domain receipts. Extend expiration date.", async function () {

    //             let domainName = 'hello_hell';

    //             userOptions.value = toEthers(0.8);

    //             await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //             await marketInstance.extendExpirationDate(domainName, userOptions);

    //             let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                 from: _user
    //             });

    //             let numOfReceipt = result[0].length;

    //             assert.equal(2, numOfReceipt, "Number of receipt does not match!");
    //         });

    //         it("Get domain receipt. Add Nth domains", async function () {

    //             let domainName = 'hello_hell';

    //             userOptions.value = toEthers(0.8);
    //             let numOfDomains = getRandomInt(2, 10);
    //             let domains = [];

    //             for (let i = 0; i < numOfDomains; i++) {
    //                 let name = domainName + '_' + i;
    //                 await marketInstance.register(name, ipToHex(ip1), userOptions);

    //                 domains.push(name);
    //             }

    //             let countOfReceipt = 0;

    //             //console.log(domains);

    //             for (let i = 0; i < domains.length; i++) {
    //                 let result = await marketInstance.getOwnerReceiptByDomain(domains[i], {
    //                     from: _user
    //                 });

    //                 countOfReceipt += parseInt(result[0].length);
    //             }

    //             assert.equal(numOfDomains, countOfReceipt, "Number of receipt does not match!");
    //         });

    //     });
    // }

    // describe('Functionality', () => {

    //     beforeEach(async function () {
    //         marketInstance = await ddns.new({
    //             from: owner
    //         });
    //     });

    //     if (editFunc) {

    //         describe('Edit domain', () => {

    //             it("Edit - Owner should edit ip address.", async function () {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.edit(domainName, ipToHex(ip2), {
    //                     from: _user
    //                 });
    //                 let newIp = await marketInstance.getIP(domainName);
    //                 newIp = hex2ip(newIp);

    //                 assert.equal(ip2, newIp, "The IP is not edited!");
    //             });

                

    //             it("Edit - Owner should edit ip address. Multiple domains", async function () {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register('hello1', ipToHex(ip1), userOptions);
    //                 await marketInstance.register('hello2', ipToHex(ip1), userOptions);
    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 await marketInstance.edit(domainName, ipToHex(ip2), {
    //                     from: _user
    //                 });
    //                 let newIp = await marketInstance.getIP(domainName);
    //                 newIp = hex2ip(newIp);

    //                 assert.equal(ip2, newIp, "The IP is not edited!");
    //             });

    //             it("Edit - Not owner should NOT edit ip address. Throw exception", async function () {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 let ipEdit = ipToHex(ip2);


    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.edit(domainName, ipEdit, {
    //                         from: _user2
    //                     });
    //                     let newIp = await marketInstance.getIP(domainName);
    //                     newIp = hex2ip(newIp);
    //                     assert.isEqual(false, "Ip address is edited!")
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Edit - Owner should NOT edit ip address of NOT existing domain.  Throw exception", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 let ipEdit = ipToHex(ip2);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.edit('hello1', ipEdit, {
    //                         from: _user
    //                     });
    //                     let newIp = await marketInstance.getIP('hello1');
    //                     newIp = hex2ip(newIp);

    //                     assert.isEqual(false, "The IP is edited!");
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Edit - Should NOT edit ip address of expired domain. Throw exception", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 let ipEdit = ipToHex(ip2);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 await utils.timeTravel(web3, year + (day * 1));

    //                 try {
    //                     await marketInstance.edit(domainName, ipEdit, {
    //                         from: _user
    //                     });

    //                     let newIp = await marketInstance.getIP(domainName);
    //                     newIp = hex2ip(newIp);

    //                     assert.isEqual(false, "The IP is edited!");
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //         });

    //     }

    //     if (transferFunc) {

    //         describe('Transfer domain', () => {

    //             ////// Transfer //////
    //             it("Transfer - Owner should transfer domain.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.transferDomain(domainName, _user2, {
    //                     from: _user
    //                 });

    //                 let currentOwner = await marketInstance.getDomainOwner(domainName);


    //                 assert.equal(_user2, currentOwner, "The owner is not changed!");
    //             });

    //             it("Transfer - Owner should transfer domain. Check receipt of the new owner.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.register(domainName + 1, ipToHex(ip1), userOptions);
    //                 await marketInstance.transferDomain(domainName, _user2, {
    //                     from: _user
    //                 });

    //                 let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                     from: _user2
    //                 });
    //                 let numOfReceipt = result[0].length;

    //                 assert.equal(1, numOfReceipt, "After transfer receipt does not transfer to the new owner!");
    //             });

    //             it("Transfer - Owner should transfer domain. Check receipt of the old owner.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.extendExpirationDate(domainName, userOptions);
    //                 await marketInstance.transferDomain(domainName, _user2, {
    //                     from: _user
    //                 });

    //                 let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                     from: _user
    //                 });
    //                 let numOfReceipt = result[0].length;

    //                 assert.equal(2, numOfReceipt, "After transfer receipt does not transfer to the new owner!");
    //             });

    //             it("Transfer - Not owner should NOT transfer domain. Throw exception", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.transferDomain(domainName, owner, {
    //                         from: _user2
    //                     });
    //                     let currentOwner = await marketInstance.getDomainOwner(domainName);

    //                     assert.isTrue(false, "The owner is changed!");
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Transfer - Should NOT transfer domain of NOT existing one. Throw exception", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.transferDomain('hello1', owner, {
    //                         from: _user
    //                     });

    //                     assert.isTrue(false, "The domain is transfer!");
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Transfer - Should NOT transfer expired domain. Throw exception", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await utils.timeTravel(web3, year + (day * 1));

    //                 try {
    //                     await marketInstance.transferDomain(domainName, owner, {
    //                         from: _user
    //                     });

    //                     assert.isTrue(false, "The domain is transfer!");
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //         })

    //     }

    //     if (expirationFunc) {

    //         describe('Extend expiration date', () => {

    //             showReceiptListInfo();

    //             //////// Extend expiration date ///////////
    //             it("Expiration Date - Owner check expiration date after registration.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 let currentTime = utils.web3Now(web3);
    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                     from: _user
    //                 });

    //                 //console.log(result[0].length);
    //                 //console.log(JSON.parse(result[0][0]))
    //                 //console.log(JSON.parse(result[1][0]))
    //                 //console.log(JSON.parse(result[2][0]))

    //                 let expirationDate = parseInt(result[2][0]);

    //                 // console.log('now');
    //                 // console.log(currentTime);
    //                 // console.log(currentTime + year);
    //                 // console.log(expirationDate);
    //                 // console.log(result[2][0]);

    //                 if (currentTime + year <= expirationDate + 10) {
    //                     assert.isTrue(true);
    //                 } else {
    //                     assert.isTrue(false, 'Expiration date is not same!');
    //                 }

    //             });

    //             it("Expiration Date - Owner should extend expiration date.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 let currentTime = utils.web3Now(web3);
    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.extendExpirationDate(domainName, userOptions);

    //                 let result = await marketInstance.getOwnerReceiptByDomain(domainName, {
    //                     from: _user
    //                 });
    //                 // result from receipt[x][y]
    //                 // X - 0 - array that contain array of prices
    //                 // X - 1 - array that contain array of creations
    //                 // X - 2 - array that contain array of expires
    //                 //
    //                 // get second receipt record /index 1/ from ownerReceipt ....
    //                 // Y - index Nth - is every additional record when extend expiration date or register again is executed
    //                 let expirationDate = parseInt(result[2][1]);

    //                 if (currentTime + year * 2 <= expirationDate + 10) {
    //                     assert.isTrue(true);
    //                 } else {
    //                     assert.isTrue(false, 'Expiration date is not same!');
    //                 }

    //             });

    //             it("Expiration Date - Owner should NOT extend expiration date of expired domain. Throw exception!", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 await utils.timeTravel(web3, year + (day * 1));

    //                 try {
    //                     await marketInstance.extendExpirationDate(domainName, userOptions);

    //                     assert.isTrue(false, 'Expiration date is changed!');
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Expiration Date - Owner should NOT extend expiration date without payment. Throw exception!", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.extendExpirationDate(domainName, {
    //                         from: _user
    //                     });

    //                     assert.isTrue(false, 'Expiration date is changed without payment!');
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Expiration Date - Not owner should NOT extend expiration date. Throw exception!", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.extendExpirationDate(domainName, {
    //                         from: _user2,
    //                         value: toEthers(1)
    //                     });

    //                     assert.isTrue(false, 'Expiration date is changed from not owner!');
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Expiration Date - Not owner should NOT extend expiration date without payment. Throw exception!", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.extendExpirationDate(domainName, {
    //                         from: _user2,
    //                         value: toEthers(1)
    //                     });

    //                     assert.isTrue(false, 'Expiration date is changed from not owner!');
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Expiration Date - Should NOT extend expiration date of NOT existing domain.", async function () {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.extendExpirationDate('hello1', userOptions);

    //                     assert.isTrue(false, 'Change expiration date of unregister domain!');
    //                 } catch (e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //         });

    //     }

    //     if(withdrawFunc){

    //         describe('Withdraw / payments tests', () => {
    //             ////////////// Withdraw /////////////////

    //             it("Contract should receive 1 ether.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 let balance = web3.eth.getBalance(marketInstance.contract.address);
                    
    //                 assert.equal(toEthers(1), balance, "Withdraw does not work correct!");
    //             });

    //             it("Contract should receive 1.8 ether.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});

    //                 let balance = web3.eth.getBalance(marketInstance.contract.address);
                    
    //                 assert.equal(toEthers(1.8), balance, "Withdraw does not work correct!");
    //             });

    //             it("Contract should receive 2.3 ether.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});
    //                 await marketInstance.register('aleksaleksaleks1', ipToHex(ip3), { from : owner, value : toEthers(0.5)});

    //                 let balance = web3.eth.getBalance(marketInstance.contract.address);
                    
    //                 assert.equal(toEthers(2.3), balance, "Withdraw does not work correct!");
    //             });

    //             it("Owner should withdraw 1 /all/ ethers.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 let beforeWithdraw = web3.eth.getBalance(marketInstance.contract.address);
                    
    //                 await marketInstance.withdraw({ from : owner});

    //                 let afterWithdraw = web3.eth.getBalance(marketInstance.contract.address);

    //                 assert.equal(0, afterWithdraw, "Withdraw does not work correct!");
    //             });

    //             it("Owner should withdraw 3.3 /all/ ethers.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);
    //                 await marketInstance.register('hello1', ipToHex(ip1), userOptions);
    //                 await marketInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});
    //                 await marketInstance.register('aleksaleksaleks1', ipToHex(ip3), { from : owner, value : toEthers(0.5)});

    //                 let beforeWithdraw = web3.eth.getBalance(marketInstance.contract.address);
                    
    //                 await marketInstance.withdraw({ from : owner});

    //                 let afterWithdraw = web3.eth.getBalance(marketInstance.contract.address);

    //                 assert.equal(0, afterWithdraw, "Withdraw does not work correct!");
    //             });

    //             it("NOT owner should try to withdraw. Throw exception!", async function() {
    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 let beforeWithdraw = web3.eth.getBalance(marketInstance.contract.address);

    //                 try {
    //                     await marketInstance.withdraw({ from : _user2});
    //                     assert.isTrue(false, 'User can use withdraw func!')
    //                 } catch(e) {
    //                     assert.isTrue(true);
    //                 }
    //             });

    //             it("Not owner should withdraw 1 ether. Balance should be the same /1 ether/.", async function() {

    //                 let domainName = 'hello';
    //                 userOptions.value = toEthers(1);

    //                 await marketInstance.register(domainName, ipToHex(ip1), userOptions);

    //                 try {
    //                     await marketInstance.withdraw({ from : _user2});
    //                     assert.isTrue(false, 'User can use withdraw func!')
    //                 } catch(e) {
    //                     assert.isTrue(true);
    //                 }

    //                 let balance = web3.eth.getBalance(marketInstance.contract.address);

    //                 assert.equal(toEthers(1), balance, "Withdraw does not work correct!");
    //             });
    //         });

    //     }
    // });
});


function toEthers(amount) {
    return web3._extend.utils.toWei(amount, 'ether');
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}