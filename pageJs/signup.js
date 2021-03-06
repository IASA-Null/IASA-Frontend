function reqSignup() {
    if (isIE()) {
        reqSignup3();
        return;
    }
    moveToForm('signup1');
    setHeader('가입하기', '다음 버튼을 누르고 웹캠에 학생증의 바코드를 보여주세요.');
    var curVid = document.getElementById('cardAnim');
    curVid.pause();
    curVid.currentTime = '0';
    setTimeout(function () {
        curVid.play();
    }, 400);
    setPrevForm("id");
}

function reqSignup2() {
    var curVid = document.getElementById('camAnim');
    curVid.style.display = "";
    curVid.pause();
    curVid.currentTime = '0';
    setTimeout(function () {
        curVid.play();
    }, 400);
    document.getElementById("iProg").style.opacity = 1;
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#qrContainer')    // Or '#yourElement' (optional)
        },
        decoder: {
            readers: ["code_128_reader"]
        }
    }, function (err) {
        if (err) {
            setTimeout(function () {
                reqSignup3();
            }, 400);
            return;
        }
        Quagga.onDetected(function (data) {
            stuId = data.codeResult.code;
            reqSignupData1();
        });
        Quagga.start();
        document.getElementById("iProg").style.opacity = 0;
        document.getElementById("qrContainer").style.display = 'block';
        curVid.style.display = "none";
    });
    moveToForm('signup2');
    setHeader('가입하기', '카메라에 바코드가 선명하게 보이게 해주세요.');
    setPrevForm("id");
}

function reqSignup3() {
    document.getElementById("iProg").style.opacity = 1;
    moveToForm('signup3');
    setHeader('본인인증 코드 입력', '계속하려면 NULL에 본인인증을 위한 24자리 코드를 요청하세요.');
    setPrevForm("id");
    setTimeout(function () {
        document.getElementById("iProg").style.opacity = 0;
    }, 400);
    setTimeout(function () {
        mdcInstance.signupCode.focus();
    }, 500);
}

let userType, userId;

function enterCode() {
    document.getElementById("iProg").style.opacity = 1;
    let code = document.getElementById('signupCode').value;
    code = code.toUpperCase();
    code = code.replaceAll('-', '');
    code = code.replaceAll(' ', '');
    fetch('https://api.iasa.kr/account/decryptcode?code=' + code).then(function (res) {
        return res.text().then(function (data) {
            return {
                status: res.status,
                body: data
            };
        });
    }).then(function (res) {
        if (res.status == 200) {
            setTimeout(function () {
                document.getElementById("iProg").style.opacity = 0;
                userId = JSON.parse(res.body).stuid;
                reqSignupData1();
            }, 400);
            setTimeout(function () {
                document.getElementById("signupCode").disabled = false;
            }, 1000);
        } else {
            loginError(3, "코드가 올바르지 않습니다.");
        }
    }).catch(function () {
        loginError(3, "코드가 올바르지 않습니다.");
    });
}

function reqSignupData1() {
    document.getElementById("iProg").style.opacity = 1;
    moveToForm('signupData1');
    setHeader('가입하기', '아래 내용을 채워주세요.');
    setPrevForm("id");
    setTimeout(function () {
        document.getElementById("iProg").style.opacity = 0;
    }, 400);
    setTimeout(function () {
        mdcInstance.signupId.focus();
    }, 500);
}

function enterSignup() {
    document.getElementById("iProg").style.opacity = 1;
    mdcInstance.signupId.disabled = true;
    mdcInstance.signupEmail.disabled = true;
    mdcInstance.signupPass.disabled = true;
    mdcInstance.signupPassConf.disabled = true;
    if (document.getElementById('signupId').value == "") {
        loginError(4, '사용할 아이디를 입력해주세요.');
        return;
    }
    if (document.getElementById('signupEmail').value == "") {
        loginError(4, '메일 주소를 입력해주세요.');
        return;
    }
    if (document.getElementById('signupEmail').checkValidity() === false) {
        loginError(4, '메일 주소가 올바르지 않습니다.');
        return;
    }
    if (document.getElementById('signupPass').value == "") {
        loginError(4, '사용할 비밀번호를 입력해주세요.');
        return;
    }
    if (document.getElementById('signupPassConf').value == "") {
        loginError(4, '비밀번호를 다시 입력해주세요.');
        return;
    }
    if (document.getElementById('signupPass').value != document.getElementById('signupPassConf').value) {
        loginError(4, '비밀번호가 같지 않습니다.');
        return;
    }
    fetch('https://api.iasa.kr/account/sendmail?stuid=' + userId + '&id=' + document.getElementById('signupId').value + '&password=' + document.getElementById('signupPass').value + '&mail=' + document.getElementById('signupEmail').value, {
        method: 'POST'
    }).then(function (res) {
        return res.text().then(function (data) {
            return {
                status: res.status,
                body: data
            };
        });
    }).then(function (res) {
        if (res.status == 200) {
            moveToForm('finSignup');
            setHeader('메일으로 인증하기', '회원가입을 완료하려면 메일함을 확인하세요.');
            setTimeout(function () {
                document.getElementById("iProg").style.opacity = 0;
            }, 500)
        } else {
            loginError(4, JSON.parse(res.body).message);
        }
    }).catch(function (e) {
        loginError(4, '오류가 발생했습니다.');
    });
}