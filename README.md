# payment

> project

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

本次实例只有两种支付方式（信用卡支付和 paypal 支付）使用的是 Braintree-国外支付对接
braintree 的相关指南请参考：https://developers.braintreepayments.com/guides/drop-in/overview/javascript/v3
braintree 在 github 的位置：https://braintree.github.io/

调用支付需要支付凭证，例子中写死了一个支付凭证用于测试，目前支付凭证赋值给 client_token 这个变量

刚一进去页面信用卡部分会先初始信用卡的填写部分
