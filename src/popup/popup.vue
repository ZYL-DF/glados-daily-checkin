<template>
    <div class="popup-page">
        <a-tabs class="popup-tabs"
                v-model:activeKey="activeKey"
                type="line"
                centered>
            <a-tab-pane key="1" tab="签到">
                <div class="checkin-part">
                    <div class="checkin-status"
                         v-if="checkinInfo.status === 'success' || checkinInfo.status === 'already'">
                        <CheckCircleOutlined style="color: chartreuse;scale: 300%"/>
                    </div>
                    <div class="checkin-status" v-else>
                        <CloseCircleOutlined style="color: palevioletred;scale: 300%"/>
                    </div>
                    <div class="checkin-info"
                         v-if="checkinInfo.status === 'success' || checkinInfo.status === 'already'">
                        <div class="checkin-info-main-text" style="color: chartreuse">
                            今日签到已完成
                        </div>
                        <div class="checkin-info-sub-text">
                            + {{ checkinInfo.point }} Pts
                        </div>
                        <div class="checkin-info-total-points">
                            Total Points : {{ checkinInfo.totalPoint }}/100
                        </div>
                    </div>
                    <div class="checkin-info" v-else>
                        <div class="checkin-info-main-text" style="color: palevioletred">
                            今日签到失败
                        </div>
                        <div class="checkin-info-sub-text">
                            账户到期或登录状态过期
                        </div>
                        <div class="re-checkin">
                            <a-button @click="checkin()" type="primary">
                                重试
                            </a-button>
                        </div>
                    </div>
                </div>

            </a-tab-pane>
            <a-tab-pane key="2" tab="用户">
                <div class="userInfo-part">
                    <div class="userInfo-content">
                        <p>
                            email:{{ userInfo.email }}
                        </p>
                        <p>
                            剩余天数:{{ userInfo.leftDays }}
                        </p>
                    </div>
                    <div class="userInfo-button">
                        <a-button @click="getUserInfo()">
                            获取用户信息
                        </a-button>
                    </div>
                </div>
            </a-tab-pane>

            <a-tab-pane key="3" tab="登录">
                <div class="login-part">
                    <a-form
                            :model="formState"
                            name="basic"
                            :label-col="{ span: 8 }"
                            :wrapper-col="{ span: 16 }"
                            autocomplete="off"
                            @finish="login()"
                    >
                        <a-form-item
                                label="Email"
                                name="email"
                                :rules="[{ required: true, message: '请输入邮箱' }]"
                        >
                            <a-input v-model:value="formState.email"/>
                        </a-form-item>

                        <a-form-item
                                label="验证码"
                                name="VerificationCode"
                                :rules="[{ required: true, message: '请输入验证码' }]"
                        >
                            <a-input v-model:value="formState.VerificationCode"/>
                        </a-form-item>

                        <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
                            <a-button type="dashed"
                                      :disabled = verificationCodeButton
                                      @click="getVerificationCode()">
                                获取验证码
                            </a-button>
                            <a-button type="primary"
                                      html-type="submit"
                                      style="margin-left: 0.8rem">
                                登录
                            </a-button>
                        </a-form-item>
                    </a-form>
                </div>
            </a-tab-pane>
        </a-tabs>

    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons-vue'
import {FormState} from "./formStateINTF.ts";
import {message} from "ant-design-vue";

const activeKey = ref('1');
const userInfo = ref({
    email: '获取失败,请重新登录',
    leftDays: 0
});

const checkinInfo = ref({
    status: 'failed',
    point: 0,
    totalPoint: 0,
    time: "1970/01/01 00:00:00"
})

const formState = reactive<FormState>({
    email: '',
    VerificationCode: '',
});

onMounted(async () => {
    await checkin()
    await getUserInfo()
})

const verificationCodeButton = computed(()=> {
    return !(formState.email !== '' && /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/.test(formState.email))
         /*
         \w{3,}:任意字母或数字至少3个
         (\.\w+)*:.加任意字符或数字至少一个，整体可有可无,0或多个
         @:一定要有@
         [A-z0-9]+:任意字母或数字至少1个
         (\.[A-z]{2,5}){1,2}:加任意字符2到5个，整体1到2个
         */
})
const getVerificationCode = async () => {

    const response = await chrome.runtime.sendMessage({sender: 'checkinPopup', action: 'getVerificationCode', data: formState.email})

    if (response.code!==undefined && response.code == 0) {
        // correct email
        message.success('验证码发送成功');
    } else {
        // incorrect email
        message.error('验证码发送失败');
    }
}
const login = async () => {
    const loginParams = {
        method: "email",
        site: "glados.network",
        email: formState.email,
        mailcode: formState.VerificationCode
    }
    const response = await chrome.runtime.sendMessage({
        sender: 'checkinPopup',
        action: 'login',
        data: loginParams
    })

    if (response.code!==undefined && response.code == -1) {
        message.error('登录失败');
    } else {
        message.success('登录成功');
        await checkin()
        await getUserInfo()
    }
}
const getUserInfo = async () => {
    const response = await chrome.runtime.sendMessage({sender: 'checkinPopup', action: 'getUserInfo'})
    if (response.code!==undefined && response.code === -2) {
        // not logged
        userInfo.value.email = '';
        userInfo.value.leftDays = 0;
    } else {
        // logged
        userInfo.value.email = response.data.email;
        userInfo.value.leftDays = parseInt(response.data.leftDays);
    }
}

const checkin = async () => {
    const response = await chrome.runtime.sendMessage({sender: 'checkinPopup', action: 'checkin'})
    switch (response.code) {
        case 0: {
            // success
            checkinInfo.value.status = "success"
            checkinInfo.value.point = parseInt(response.list[0].change);
            checkinInfo.value.totalPoint = parseInt(response.list[0].balance);
            checkinInfo.value.time = getTimeFromStamp(response.list[0].time)
            break;
        }
        case 1: {
            // already
            checkinInfo.value.status = "already"
            checkinInfo.value.point = parseInt(response.list[0].change);
            checkinInfo.value.totalPoint = parseInt(response.list[0].balance);
            checkinInfo.value.time = getTimeFromStamp(response.list[0].time)
            break;
        }
        default: {
            // failed
            checkinInfo.value.status = "failed"
            checkinInfo.value.point = 0;
            checkinInfo.value.totalPoint = 0;
            checkinInfo.value.time = "1970/01/01 00:00:00"
        }
    }
}

const getTimeFromStamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
}
</script>

<style scoped>
.popup-page {
    position: relative;
    width: 14rem;
    height: 14rem;
}

.popup-tabs {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

.checkin-part {
    position: absolute;
    left: 0;
    width: 100%;
    height: auto;
    margin-top: 0.3125rem;
    box-sizing: border-box;
    padding-left: 10%;
    padding-right: 10%;
}

.checkin-status {
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 20%;
    padding-left: 10%;
}

.checkin-info {
    position: absolute;
    left: 20%;
    width: 80%;
}

.checkin-info-main-text {
    position: relative;
    left: 15%;
    top: 0;
    width: fit-content;
    font-size: 1.3rem;
    font-family: "Microsoft YaHei", "sans-serif";
    font-weight: bolder;
}

.checkin-info-sub-text {
    position: relative;
    left: 15%;
    top: 0.2rem;
    width: fit-content;
    font-size: small;
    font-family: "Microsoft YaHei UI", sans-serif;
    color: lightgrey;
}

.re-checkin {
    position: relative;
    left: 20%;
    width: fit-content;
    top: 3rem;
}

.checkin-info-total-points {
    position: relative;
    left: -20%;
    text-align: center;
    font-size: 1.1rem;
    font-family: "Microsoft YaHei", sans-serif;
    width: 110%;
    top: 3rem;
}

.userInfo-part {
    position: absolute;
    left: 0;
    width: 100%;
    height: auto;
    margin-top: 0.2rem;
    box-sizing: border-box;
    padding-left: 10%;
    padding-right: 10%;
}

.userInfo-content {
    position: relative;
    font-family: "Microsoft YaHei", sans-serif;
    font-weight: bold;
}

.userInfo-button {
    position: relative;
    left: 0;
    top: 1rem;
    display: flex;
    justify-content: center;
}

.login-part {
    position: absolute;
    left: 0;
    width: 100%;
    height: auto;
    margin-top: 0;
    box-sizing: border-box;
    padding-left: 10%;
    padding-right: 10%;
}
</style>
