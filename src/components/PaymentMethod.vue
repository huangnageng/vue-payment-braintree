<template>
  <div>
    <div class="mg_list">
      <div class="mg_list_title">
        <p>Payment Method</p>
      </div>
      <div class="mg_list_content">
        <div class="pay_method">
          <div class="pay_t" @click="checkMethod('credit')">
            <p>Pay with a Credit Card</p>
            <div class="icon_box"><img :src="IsSelectCard?selectIcon:unselectIcon" alt=""></div>
          </div>
          <div class="pay_content" v-show="IsSelectCard">
            <!-- 信用卡支付结果 -->
            <div class="pay_result" v-show="IsShowCard">
              <div class="pay_select">
                <div id="card-image" :class="payImgType"></div>
                <span>ending in {{abbrAccount}}</span>
              </div>
              <div class="pay_change" @click="IsShowCard=false">
                <p>Change</p>
              </div>
            </div>
            <!-- 支付新增 开始 -->
            <div class="scale-down" v-show="!IsShowCard&&!showLoading">
              <form id="my-sample-form">
                <div class="cardinfo-card-number">
                  <label class="cardinfo-label" for="card-number">Card Number</label>
                  <div :class='cardtips!==""?"err_input input-wrapper":"input-wrapper"' id="card-number"></div>
                  <span class="error_tip">{{cardtips}}</span>
                </div>

                <div class="cardinfo-wrapper">
                  <div class="cardinfo-exp-date">
                    <label class="cardinfo-label" for="expiration-date">Valid Thru</label>
                    <div class='input-wrapper' id="expiration-date"></div>
                  </div>

                  <div class="cardinfo-cvv">
                    <label class="cardinfo-label" for="cvv">CVV</label>
                    <div class='input-wrapper' id="cvv"></div>
                  </div>
                </div>
              </form>
              <div class="creadit_card_btn">
                <input id="creadit_card_submit" class="show-button" type="submit" value="SUBMIT" @click="cardSubmit" />
              </div>
              <div class="pay_cancel" v-show="hasSelectCard" @click="IsShowCard=true">
                <p>Cancel</p>
              </div>
            </div>
            <div class="scale-down" v-show="!IsShowCard&&showLoading">
              <img v-show="!IsNoPayInput" class="noPay_loading" src="@/assets/images/public/loading.gif" alt="Loading...">
              <div v-show="IsNoPayInput" class="noPay_input">
                <p>The payment input box can not load.</p>
                <p>Please refresh the page again...</p>
              </div>
            </div>
            <!-- 支付新增 结束 -->
          </div>
        </div>
        <div class="pay_method">
          <div class="pay_t" @click="checkMethod('paypal')">
            <p>Check with PayPal</p>
            <div class="icon_box"><img :src="IsSelectCard?unselectIcon:selectIcon" alt=""></div>
          </div>
          <div class="pay_content" v-show="!IsSelectCard">
            <div class="paypal_result">
              <div class="paypal_e">
                <p>{{pay_email}}</p>
              </div>
              <div class="paypal_change" @click="paypalSubmit">
                <p>Change</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="iframe_popup" v-show="IsShowIframe">
      <div id="iframe_box"></div>
      <div class="iframe_close" @click="IsShowIframe = false">
        <img src="@/assets/images/public/public_popup_close.png" alt="">
      </div>
    </div>

  </div>
</template>


<script>
// import axiosMbs from '@/utils/axios.mbs.js'; //接口调用的总的方法，先注释，请勿删
import global from '@/utils/utils.js';
import Cookies from 'js-cookie'

import braintreeclient from 'braintree-web/client'
import hostedFields from 'braintree-web/hosted-fields'
import braintreepaypal from 'braintree-web/paypal'
import braintreethreeDSecure from 'braintree-web/three-d-secure'

import valid from 'card-validator'

let that
export default {
  name: "CreaditCard",
  data () {
    return {
      unselectIcon: require('@/assets/images/shopping/shopping_radio_unselected.png'),
      selectIcon: require('@/assets/images/shopping/shopping_radio_selected.png'),
      IsSelectCard: true,
      testcard: '',//信用卡号
      testdate: '',//信用卡过期日期
      testcvv: '',//cvv
      client_token: '',
      hostedFieldsInstance: '',
      paypalInstance: '',
      clientInstance: '',
      cardtips: '',//信用卡错误信息提示
      IsShowIframe: false,//是否展示输入信用卡密码的遮罩
      payType: '',//支付类型
      abbrAccount: '',//支付类型
      payment_nonce: '',//支付nonce，用于提交订单
      IsShowCard: false,//是否展示信用卡
      hasSelectCard: false,//是否选择了信用卡
      paypayNonce: '',//paypal的nouce
      cardNonce: '',//信用卡的nouce
      pay_email: '',//选择paypal后的返回的paypal邮箱
      showLoading: true,
      IsNoPayInput: false,
      payImgType: '',
      amounttotal: 99//需要支付的价格，为了测试初始设定为99
    }
  },
  // props: ['amounttotal'],
  created () {
    that = this
    that.getBrainClient();
  },
  methods: {
    checkMethod (paytype) {
      if (paytype === 'paypal') {
        if (that.paypayNonce === '') {
          that.paypalSubmit();
        } else {
          that.payment_nonce = that.paypayNonce;
          that.IsSelectCard = false
          //把nonce传给checkout                  
          that.$emit("getPaymentNonce", that.payment_nonce, that.payType, that.abbrAccount)
        }
      } else {
        that.payment_nonce = that.cardNonce;
        that.IsSelectCard = true
        //把nonce传给checkout        
        that.$emit("getPaymentNonce", that.payment_nonce, that.payType, that.abbrAccount)
      }
    },
    getBrainClient () {
      /*
        ----正常情况下从调接口后台那边拿到支付凭证client_token（代码如下），
        ----由于我的是测试玩的，就弄个空值

        axiosMbs({
          url: "/PaymentApi/PayRequest",
          loginValidation: true,
          data: {
            cusgradeid: Cookies.get('user-cusGradeID'),
            payTypeCode: 'BRAINTREE',
            platForm: "2",
          }
        }).then(function (data) {
          //为了拿到支付凭证client_token
          that.client_token = data.data.Body.Data;
          that.getBrainTree();
        });
      */
      that.client_token = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiI4MDE1Nzk3ODE4N2I5MDE5NWRhOTc1MzBiZjYwMGY2MzFhNzE5OWZjMDEwODc1MjlmZDBjMWJhZWE3MmFkODJmfGNyZWF0ZWRfYXQ9MjAxOC0wOS0yNVQwNToyMjozMC42MzA3MDI2MjArMDAwMFx1MDAyNm1lcmNoYW50X2FjY291bnRfaWQ9Q29jb0phaW1lc29uX2luc3RhbnRcdTAwMjZtZXJjaGFudF9pZD1mZHNzYzdkdmducG5nY2trXHUwMDI2cHVibGljX2tleT1uZzdnYzR2cXB3aGRxNTJwIiwiY29uZmlnVXJsIjoiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy9mZHNzYzdkdmducG5nY2trL2NsaWVudF9hcGkvdjEvY29uZmlndXJhdGlvbiIsImdyYXBoUUwiOnsidXJsIjoiaHR0cHM6Ly9wYXltZW50cy5icmFpbnRyZWUtYXBpLmNvbS9ncmFwaHFsIiwiZGF0ZSI6IjIwMTgtMDUtMDgifSwiY2hhbGxlbmdlcyI6WyJjdnYiXSwiZW52aXJvbm1lbnQiOiJwcm9kdWN0aW9uIiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy9mZHNzYzdkdmducG5nY2trL2NsaWVudF9hcGkiLCJhc3NldHNVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczovL2F1dGgudmVubW8uY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5icmFpbnRyZWVnYXRld2F5LmNvbS9mZHNzYzdkdmducG5nY2trIn0sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsInBheXBhbEVuYWJsZWQiOnRydWUsInBheXBhbCI6eyJkaXNwbGF5TmFtZSI6IkZhbW1hIEdyb3VwLCBJbmMuIiwiY2xpZW50SWQiOiJBUVJqeXoyWXMyUFp5QjA5Z1g3eTR4RnFxOXFNUG1hMXBtTlZ6d3Y5ZURYRkZGWFBBNEplX2ZVY0tFcHZjRmFPeFZjN1lNT0F5NEIxdk1uVSIsInByaXZhY3lVcmwiOiJodHRwczovL3d3dy5mYW1tYWdyb3VwaW5jLm5ldCIsInVzZXJBZ3JlZW1lbnRVcmwiOiJodHRwczovL3d3dy5mYW1tYWdyb3VwaW5jLm5ldCIsImJhc2VVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImFzc2V0c1VybCI6Imh0dHBzOi8vY2hlY2tvdXQucGF5cGFsLmNvbSIsImRpcmVjdEJhc2VVcmwiOm51bGwsImFsbG93SHR0cCI6ZmFsc2UsImVudmlyb25tZW50Tm9OZXR3b3JrIjpmYWxzZSwiZW52aXJvbm1lbnQiOiJsaXZlIiwidW52ZXR0ZWRNZXJjaGFudCI6ZmFsc2UsImJyYWludHJlZUNsaWVudElkIjoiQVJLcllSRGgzQUdYRHpXN3NPXzNiU2txLVUxQzdIR191V05DLXo1N0xqWVNETlVPU2FPdElhOXE2VnBXIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjp0cnVlLCJtZXJjaGFudEFjY291bnRJZCI6IkNvY29KYWltZXNvbl9pbnN0YW50IiwiY3VycmVuY3lJc29Db2RlIjoiVVNEIn0sIm1lcmNoYW50SWQiOiJmZHNzYzdkdmducG5nY2trIiwidmVubW8iOiJvZmYiLCJtZXJjaGFudEFjY291bnRJZCI6IkNvY29KYWltZXNvbl9pbnN0YW50In0=";
      that.getBrainTree();
    },
    getBrainTree () {
      braintreeclient.create({
        authorization: that.client_token
      }, function (err, clientInstance) {
        that.clientInstance = clientInstance
        // hostedFields.create(/* ... */);
        //paypal按钮初始化
        braintreepaypal.create(
          {
            client: clientInstance
          },
          function (paypalErr, paypalInstance) {
            if (paypalErr) {
              var paypal_error = "Error creating PayPal:" + paypalErr;
              console.log(paypal_error);
              return;
            }

            that.paypalInstance = paypalInstance
          }
        );

        ///////////////////////////////////////////////信用卡支付
        // Create input fields and add text styles  
        hostedFields.create({
          client: clientInstance,
          styles: {
            'input': {
              'color': '#282c37',
              'font-size': '16px',
              'transition': 'color 0.1s',
              'line-height': '3'
            },
            // Style the text of an invalid input
            'input.invalid': {
              'color': '#E53A40'
            },
            // placeholder styles need to be individually adjusted
            '::-webkit-input-placeholder': {
              'color': '#a2a2a2',
            },
            ':-moz-placeholder': {
              'color': '#a2a2a2'
            },
            '::-moz-placeholder': {
              'color': '#a2a2a2'
            },
            ':-ms-input-placeholder': {
              'color': '#a2a2a2'
            }
          },
          // Add information for individual fields
          fields: {
            number: {
              selector: '#card-number',
              placeholder: 'Card number'
            },
            cvv: {
              selector: '#cvv',
              placeholder: 'CVV'
            },
            expirationDate: {
              selector: '#expiration-date',
              placeholder: 'MM/YY'
            }
          }
        }, function (err, hostedFieldsInstance) {
          if (err) {
            console.log(err)
            that.IsNoPayInput = true
            return;
          }
          //展示生成的输入框
          that.showLoading = false

          hostedFieldsInstance.on('validityChange', function (event) {
            var field = event.fields[event.emittedBy];

            if (field.isValid) {
              if (event.emittedBy === 'expirationMonth' || event.emittedBy === 'expirationYear') {
                if (!event.fields.expirationMonth.isValid || !event.fields.expirationYear.isValid) {
                  return;
                }
              } else if (event.emittedBy === 'number') {
                that.cardtips = ''
              }
            } else if (field.isPotentiallyValid) {
              if (event.emittedBy === 'number') {
                that.cardtips = ''
              }
            } else {
              if (event.emittedBy === 'number') {
                that.cardtips = 'Please provide a valid Credit Card number.'
              }
            }

          });

          // hostedFieldsInstance.on('empty', function (event) {
          // $('header').removeClass('header-slide');
          // $('#card-image').removeClass();
          // form.removeClass();
          // });

          hostedFieldsInstance.on('cardTypeChange', function (event) {
            // Change card bg depending on card type
            if (event.cards.length === 1) {
              var theclass = event.cards[0].type;

              // Change the CVV length for AmericanExpress cards
              if (event.cards[0].code.size === 4) {
                hostedFieldsInstance.setAttribute({
                  field: 'cvv',
                  attribute: 'placeholder',
                  value: '1234'
                });
              }
            } else {
              hostedFieldsInstance.setAttribute({
                field: 'cvv',
                attribute: 'placeholder',
                value: '123'
              });
            }
          });

          //卡支付初始化按钮
          that.hostedFieldsInstance = hostedFieldsInstance

        });
      });
    },
    cardSubmit () {
      // app.riseLoader();
      //点击后模拟loading
      that.hostedFieldsInstance.tokenize(function (err, payload) {
        if (err) {
          // that.$dialog.toast({
          //   mes: err.message,
          //   timeout: 3000,
          //   icon: 'error'
          // });
          alert(err.message)
          // app.declineLoader();
          return;
        }
        //3D安全初始化
        // var my3DSContainer = $("#paypal_3d_container");
        braintreethreeDSecure.create(
          {
            client: that.clientInstance
          },
          function (threeDSecureErr, threeDSecure) {

            if (threeDSecureErr) {
              app.declineLoader();
              // that.$dialog.toast({
              //   mes: "Error creating 3DSecure" + threeDSecureErr,
              //   timeout: 3000,
              //   icon: 'error'
              // });
              alert("Error creating 3DSecure" + threeDSecureErr)
              return;
            }
            else {
              let testdiv = document.getElementById("iframe_box");
              threeDSecure.verifyCard(
                {
                  nonce: payload.nonce,
                  amount: that.amounttotal,
                  addFrame: function (err, iframe) {
                    // Set up your UI and add the iframe.
                    app.declineLoader();
                    testdiv.innerHTML = ''
                    that.IsShowIframe = true
                    testdiv.appendChild(iframe);
                  },
                  removeFrame: function () {
                    //Remove UI that you added in addFrame.
                    that.IsShowIframe = false
                    // app.riseLoader()
                  }
                },
                function (err, thpayload) {
                  that.IsShowIframe = false
                  if (err) {
                    // that.$dialog.toast({
                    //   mes: err.details.originalError.error.message,
                    //   timeout: 3000,
                    //   icon: 'error'
                    // });
                    alert(err.details.originalError.error.message)

                    return;
                  }


                  //3D安全校验
                  if ((thpayload.liabilityShiftPossible && thpayload.liabilityShifted) || (!thpayload.liabilityShiftPossible)) {
                    let end_date = payload.description;
                    let cartp = payload.details.cardType;
                    that.payType = cartp;
                    // 支付图标类型
                    that.payImgType = that.changeToImgType(cartp)
                    //卡的后四位
                    that.abbrAccount = payload.details.lastFour;
                    that.hasSelectCard = true
                    that.IsShowCard = true
                    //把nonce赋值给全局变量
                    that.payment_nonce = thpayload.nonce;
                    that.paypayNonce = '';
                    that.cardNonce = thpayload.nonce;
                    //把nonce传给checkout
                    that.$emit("getPaymentNonce", that.payment_nonce, that.payType, that.abbrAccount)

                    //把已支付的paypal信息隐藏
                    // $(".hadPaypal").hide();
                    // $(".nohasPaypal").show();
                    app.declineLoader();
                    //清除card输入的信息
                    that.hostedFieldsInstance.clear('number');
                    that.hostedFieldsInstance.clear('cvv');
                    that.hostedFieldsInstance.clear('expirationDate');

                  } else {
                    // app.declineLoader();
                    // that.$dialog.toast({
                    //   mes: "Card verification is invalid!",
                    //   timeout: 3000,
                    //   icon: 'error'
                    // });
                    alert("Card verification is invalid!")

                  }
                  // $(window.frames["braintree-hosted-field-number"].document).find("#credit-card-number").val('');
                }
              );
            }
          });
      });
    },
    changeToImgType (carty) {
      let newcart = carty.split(" ")
      newcart = newcart.join("-").toLowerCase()
      return newcart
    },
    paypalSubmit () {
      app.riseLoader();
      that.paypalInstance.tokenize(
        {
          flow: "checkout",
          amount: that.amounttotal,
          // amount: 99,
          currency: "USD"
        },
        function (tokenizeErr, payload) {
          //移除paypal支付的选中效果
          app.declineLoader();

          if (tokenizeErr) {
            if (tokenizeErr.type !== "CUSTOMER") {
              var paypal_error =
                "Error tokenizing:" + tokenizeErr;
              // that.$dialog.toast({
              //   mes: paypal_error,
              //   timeout: 3000,
              //   icon: 'error'
              // });
              alert(paypal_error)
            }
            return;
          }
          var pay_email = payload.details.email;
          // Tokenization succeeded 把nonce赋值给全局变量
          that.payment_nonce = payload.nonce;
          that.paypayNonce = payload.nonce

          //把credit card有支付完的信息隐藏或清除
          that.cardNonce = ''
          that.IsSelectCard = false
          that.IsShowCard = false
          that.hasSelectCard = false

          that.payType = "PayPal";
          // 支付图标类型
          that.payImgType = 'payPal'
          that.pay_email = pay_email;
          that.abbrAccount = pay_email;

          //把nonce传给checkout          
          that.$emit("getPaymentNonce", that.payment_nonce, that.payType, that.abbrAccount)
        }
      );
    },
  }
}
</script>
<style scoped lang="less">
@import '../assets/less/cartProcess.less';
</style>