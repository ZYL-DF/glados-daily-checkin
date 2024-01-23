chrome.runtime.onStartup.addListener(async function () {
    let checkinStatus = "签到失败"
    let checkinPoint = 0;
    let checkinTotal = 0;
    let message = "";

    await checkinBack((response) => {
        switch (response.code) {
            case 0: {
                // success
                checkinStatus = "签到成功"
                checkinPoint = parseInt(response.list[0].change);
                checkinTotal = parseInt(response.list[0].balance);
                message = "获得" + checkinPoint + "Pts,总计获得" + checkinTotal + "Pts"
                break;
            }
            case 1: {
                // already
                checkinStatus = "已签到"
                checkinPoint = parseInt(response.list[0].change);
                checkinTotal = parseInt(response.list[0].balance);
                message = ""
                break;
            }
            default: {
                // failed
                checkinStatus = "签到失败"
                checkinPoint = 0;
                checkinTotal = 0;
                message = "点击插件图标查看详情"
            }
        }
        if(checkinStatus !== "已签到") {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/images/app.png',
                title: checkinStatus,
                message: message,
                eventTime: Date.now() + 5000
            });
        }
    });


});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sender === "checkinPopup") {
        if (message.action === "getUserInfo") {
            getUserInfoBack(sendResponse);
            return true;
        } else if (message.action === "checkin") {
            checkinBack(sendResponse);
            return true;
        } else if (message.action === "getVerificationCode") {
            chrome.cookies.getAll({domain: 'glados.rocks'}, function (cookies) {
                const url = "https://glados.rocks/api/authorization";
                const cookie = cookies.filter((e) => e.domain.indexOf("glados.rocks") !== -1);
                const headers = {
                    'Content-Type': 'application/json;charset=UTF-8', // 设置请求头部信息
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookie
                };

                fetch(url, {
                    headers: headers,
                    credentials: "include",
                    method: "POST",
                    body: JSON.stringify({
                        address: message.data,
                        site: "glados.network"
                    })
                })
                    .then(response => {
                        return response.json()
                    })
                    .then(response => {
                        sendResponse(response)
                    })
                    .catch(err => console.error('error', err))
            });
            return true;
        } else if (message.action === "login") {
            chrome.cookies.getAll({domain: 'glados.rocks'}, function (cookies) {
                const url = "https://glados.rocks/api/login";
                const cookie = cookies.filter((e) => e.domain.indexOf("glados.rocks") !== -1);
                const headers = {
                    'Content-Type': 'application/json;charset=UTF-8', // 设置请求头部信息
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookie
                };

                fetch(url, {
                    headers: headers,
                    credentials: "include",
                    method: "POST",
                    body: JSON.stringify(message.data)
                })
                    .then(response => {
                        return response.json()
                    })
                    .then(response => {
                        sendResponse(response)
                    })
                    .catch(err => console.error('error', err))
            });
            return true;
        }
    }
})

const getUserInfoBack = (sendResponse) => {
    chrome.cookies.getAll({domain: 'glados.rocks'}, function (cookies) {
        const url = "https://glados.rocks/api/user/status";
        const cookie = cookies.filter((e) => e.domain.indexOf("glados.rocks") !== -1);
        const headers = {
            'Content-Type': 'application/json, text/plain, */*', // 设置请求头部信息
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookie
        };

        fetch(url, {
            headers: headers,
            credentials: "include",
            method: "GET",
        })
            .then(response => {
                return response.json()
            })
            .then(response => {
                sendResponse(response)
            })
            .catch(err => console.error('error', err))
    });
}

const checkinBack = (sendResponse) => {
    chrome.cookies.getAll({domain: 'glados.rocks'}, function (cookies) {
        const url = "https://glados.rocks/api/user/checkin";
        const cookie = cookies.filter((e) => e.domain.indexOf("glados.rocks") !== -1);
        const headers = {
            'Content-Type': 'application/json;charset=UTF-8', // 设置请求头部信息
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookie
        };

        fetch(url, {
            headers: headers,
            credentials: "include",
            method: "POST",
            body: JSON.stringify({
                token: "glados.one"
            })
        })
            .then(response => {
                return response.json()
            })
            .then(response => {
                sendResponse(response)
            })
            .catch(err => console.error('error', err))
    });
}
