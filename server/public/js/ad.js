if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => {
            console.log("Registered");
        })
        .catch((err) => {
            console.log(err);

        })
}
var token = localStorage.getItem("_t");
var crrUserData;

try {
    var storage = firebase.storage();
    var messaging = firebase.messaging()
    var database = firebase.database()
    if (category) {
        fetchCategoryAds(category)
    }
} catch (e) {
}

//*******************Authentication*********//
var page = location.href.split("/").pop().split(".")[0];
if (page == 'login' || page == 'register') {
} else {
    authUser();
}
initiateLoader();
if (page == 'index' || page == '') {
    fetchIndexAds();
}
if (page == 'showAd') {
    createAdDetails();
}
function authUser() {
    if (token) {
        if (document.querySelector("#logIn")) {
            document.querySelector("#logIn").style.display = 'none';
        }
        document.querySelector('#user').innerHTML = `
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        `
        fetch(`${url}/auth`, {
            headers: {
                "x-auth": token
            }
        })
            .then((res) => res.json())
            .then((userData) => {
                crrUserData = userData;

                var HTML = "";
                HTML += createUserTray(userData);
                document.querySelector('#user').innerHTML = HTML;
                switch (page) {
                    case "fav":
                        fetchFavAd(crrUserData.fav)
                        break;
                    case "myAds":
                        fetchMyAds(crrUserData._id)
                        break;
                    //     case "notification":
                    //         var cat = JSON.parse(localStorage.getItem('category'));
                    //         var key = JSON.parse(localStorage.getItem('productKey'));
                    //         if (cat && key) {
                    //             getNotification(userId, cat, key)
                    //             break;
                    //         }
                    //     case "buy":
                    //         getChat(userId)
                    //         break;
                }
                messaging.requestPermission()
                    .then(() => {
                        console.log("Permission Granted");
                        return messaging.getToken()
                    }).then((token) => {
                        console.log(token);
                        database.ref(`tokens/${crrUserData._id}`).set({
                            token: token
                        })
                    })
                messaging.onMessage(function (payload) {
                    console.log('payload', payload);
                })
            })

    } else {
        // No user is signed in.
        if (page === 'post-ad' || page === 'fav' || page === 'notification' || page === 'myAds' || page === 'buy') {
            location.href = 'login.html'
        }
    }
}

//**************************Ad Creators**********************//


//**************************INDEX/ADS********************//
function fetchIndexAds() {
    fetch(`${url}/index.html/getAds`).then((res) => {
        return res.json();
    }).then((ads) => {
        var HTML = "";
        for (var i in ads) {
            var div = document.createElement('div');
            div.className = `animated fadeInRight`
            div.innerHTML = createAd(ads[i])
            if (i < 3) {
                document.querySelector('#list1').appendChild(div)
            }
            else if (i >= 3 && i < 6) {
                document.querySelector('#list2').appendChild(div)
            }
            else if (i >= 6 && i < 9) {
                document.querySelector('#list3').appendChild(div)
            }
        }
        removeLoader(`#indexLoader`)
    })
}
//********************Category/Ads***********************//
function fetchCategoryAds(page) {
    if (!document.querySelector(`#${page}List`)) {
        return;
    }
    fetch(`${url}/getCategoryAds/${page.toLowerCase()}`).then((res) => {
        return res.json()
    }).then((ads) => {
        if (!ads.length) {
            document.querySelector(`#${page}List`).innerHTML = "<strong>NO AD FOR THIS CATEGORY YET</strong>"
            return;
        }
        var HTML = "";
        for (var i in ads) {
            HTML += createAd(ads[i])
        }
        document.querySelector(`#${page}List`).innerHTML = HTML
    })
}

function searchCategory(category) {
    if (category == -1) {
        return;
    }
    location.href = `${category}.html`
}
function searchName(params) {
    var keyword = params.value;
    var HTML;
    if (!keyword) {
        return fetchCategoryAds(category)
    }

    HTML = `<h3>You Are Searching For "${keyword}"</h3>`

    fetch(`${url}/search/${category.toLowerCase()}/${keyword}`).then((res) => {
        return res.json()
    }).then((result) => {
        if (!result.length) {
            document.querySelector(`#${category.toUpperCase()}List`).innerHTML = `
            ${HTML}
            <p>Not Found</p>
            `
            return;
        }
        for (var i in result) {
            HTML += createAd(result[i]);
        }
        document.querySelector(`#${category}List`).innerHTML = HTML
    })

}

function fetchMyAds(id) {
    var list = document.querySelector(`#myAdsList`)
    fetch(`${url}/myAds/${id}`, {
        headers: {
            'x-auth': token
        }
    }).then((res) => {
        return res.json()
    }).then((ads) => {
        if (!ads.length) {
            list.innerHTML = `<strong>Not Yet Posted</strong>`
            return;
        }
        var HTML = "";
        for (var i in ads) {
            var data = ads[i];
            var adData = JSON.stringify(data)
            HTML += `
                <div class="col-sm-4 col-6  img-thumbnail cardDiv animated fadeIn" style='' id='${i}'>
                <div class="card ">
                    <div class="user-card-profile  text-center">
                        <img class="" style='width:200px;height:150px;' src="${data.src}" alt="">
                    </div>
                    <div class="designation m-t-27 m-b-27 text-center">
                        <h4> ${data.title}</h4>
                    </div>
                    <div class='adCont'>
                        <div class='col-sm-6 col-xs-6 text-left adDiv'>
                            <ul class='adUl'>
                                <li>
                                    <i class="fas fa-money-check-alt"></i> Price</li>
                                <li>
                                    <i class='fa fa-phone'></i> Contact</li>
                            </ul>
                        </div>
                        <div class='col-sm-6 col-xs-6 text-right adDiv'>
                            <ul class='adUl'>
                                <li>${data.price} PKR</li>
                                <li>${data.contact}</li>
                            </ul>
                        </div>
                        <div class=' text-center '>
                            <div class='col-sm-12 adDateData '>
                                <i class="far fa-clock"></i> ${data.adDate}
                            </div>
                            </div>
                            <div class='text-center'>
                            <div class='col-sm-6 '>
                                <a href='JavaScript:void(0)' class='btn btn-info adBtn' onclick='showAd(${adData})'><i class="fas fa-eye"></i> View Details</a>
                            </div>
                            <div class='col-sm-6 '>
                                <a href='JavaScript:void(0)' class='btn btn-success adBtn' onclick='notification("${data.category}","${data.productKey}")'><i class="fas fa-bell fa-lg"></i> Notifications</a>
                            </div>
                            <div class='col-sm-6 '>
                            <a href='JavaScript:void(0)' class='btn btn-warning adBtn' onclick='editDetails(${adData})'><i class="far fa-edit"></i> Edit Details</a>
                        </div>
                        <div class='col-sm-6 '>
                        <a href='JavaScript:void(0)' class='btn btn-danger adBtn' onclick="deleteAd('${data._id}',${i})"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a>
                        </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        `
        }
        removeLoader()
        list.innerHTML += HTML;
    })

}

function deleteAd(id, i) {
    fetch(`${url}/deleteAd/${crrUserData._id}/${id}`, {
        method: "DELETE",
        headers: {
            "x-auth": token
        }
    }).then((res) => {
        return res.json()
    }).then((ad) => {
        document.querySelector('#myAdsList').removeChild(document.getElementById(`${i}`));

    }).catch((err) => {
        console.log(err);
    })

}

function editDetails(data) {
    console.log(data);
    if (document.querySelector(`.editModalBox`)) {
        document.querySelector(`.editModal`).classList += 'animated fadInUp';
        document.body.removeChild(document.querySelector('.editModalBox'))
    }
    var div = document.createElement('div');
    div.className = 'editModalBox'
    div.innerHTML = `
    <div class="editModal animated fadeInDown">
    <div class="editHeader">
        <h1>Edit Details</h1>
        <button class="btn btn-danger editCloseBtn" onclick="closeEdit()">Close</button>
    </div>
    <div class="editMain">
    <form action='javascript:void(0)' style='padding-bottom:10px;' onsubmit='newDetails(${JSON.stringify(data)})' id='editForm'>
        <div>
            <label for="title">Title*
                <input type="text" name="title" id="title" value="${data.title}">
            </label>
        </div>
        <div>
            <label for="model">Model*
                <input type="text" name="model" id="model" value="${data.model}">
            </label>
        </div>
        <div>
            <label for="description">Description*
                <input type="text" name="description" id="description" value="${data.description}">
            </label>
        </div>
        <div>
            <label for="price">Price*
                <input type="text" name="price" id="price" value="${data.price}">
            </label>
        </div>
        <div>
            <label for="productImage" id='pad'>
                Image*
                <div class="imgCon">
                    <input type="file" name="photoSelect" style="display:none" onchange="showImg('picShow','photoSelect')" id="photoSelect">
                    <div class="brwBox">
                        <img src="${data.src}" class='pic' alt="" id="picShow">
                        <div>
                            <input type="button" class="btn btn-success brwBtn" style="width:150px;" name="" value="Browse" id="browse" onclick="document.querySelector('#photoSelect').click()">
                        </div>
                    </div>
                </div>
            </label>
        </div>
        <div class='text-center'>
        <button typye='submit' class='btn editBtn'>Update</button>
        </div>
        </form>
    </div>
    <div class="editFooter text-center">
        <img src="images/logo.png" width="200px;" alt="KHAREEDLO">
    </div>
</div>
    `
    document.body.appendChild(div);
}
function newDetails(data) {
    console.log(data);
    createMsg("primary", "processing Given Data")
    var formData = new FormData(document.querySelector('#editForm'));
    var item = {
        price: formData.get("price"),
        model: formData.get('model'),
        title: formData.get("title"),
        description: formData.get("description"),
        adDate: data.adDate,
        contact: data.contact,
        category: data.category,
        _id: data._id,
        sellerId: data.sellerId
    }
    var img = document.querySelector('#photoSelect').files[0]
    if (img) {
        storage.ref(`adsImg/${data.category}/${img.name + Math.random()}`).put(document.querySelector('#photoSelect').files[0])
            .then((snapShot) => {
                return snapShot.ref.getDownloadURL();
            })
            .then((url) => {
                item.src = url
                return postEdit(item)
            }).catch((err) => {
                console.log(err);
                createMsg("danger", err.message)
            })
    } else {
        item.src = data.src
        return postEdit(item)
    }
}
function postEdit(item) {
    console.log(item);
    fetch(`${url}/editPost/${item.sellerId}/${item._id}`, {
        method: "PATCH",
        headers: {
            "x-auth": token,
            "Content-type": 'application/json',

        },
        body: JSON.stringify(item)
    }).then((res) => {
        return res.json()
    }).then((result) => {
        console.log(result);

        createMsg("success", "Posted Successfully")
        document.querySelector("#editForm").reset();
        // document.querySelector('#picShow').src = 'images/upload.png'
        location.reload()
    })
        // .then(() => {
        //         database.ref("notifications/notification").set({
        //             posterName: crrUserName,
        //             productImg: url,
        //             category: data.category,
        //             msgDate: (new Date()).toLocaleDateString(),
        //             msgTime: (new Date()).toLocaleTimeString(),
        //         })
        //     })
        // })
        .catch((err) => {
            console.log(err);
        })

}
function closeEdit() {
    if (document.querySelector(`.editModalBox`)) {
        document.body.removeChild(document.querySelector('.editModalBox'))
        // document.querySelector(`.editModal`).classList += 'animated fadInUp';

    }
}
function addToFav(id) {
    if (!token) {
        window.location.href = '/login.html'
    }
    fetch(`${url}/addToFav/${id}`, {
        method: "PATCH",
        headers: {
            "x-auth": token
        }
    }).then((res) => {
        return res.json()
    }).then((result) => {
        createMsg("primary", result.message)
    }).catch((err) => {
        console.log(err);
    })
}
function fetchFavAd(fav) {
    if (!fav.length) {
        document.querySelector('#favList').innerHTML = `
        <strong>Not Yet Added</strong>
        `
    }
    var HTML = "";
    for (var i in fav) {
        fetch(`getFav/${fav[i]._id}`, {
            headers: {
                "x-auth": token
            }
        }).then((res) => {
            return res.json()
        }).then((ads) => {
            HTML += createAd(ads)
            document.querySelector(`#favList`).innerHTML = HTML
        })
    }
}


//**********************Post-Ad******************//
function postAd() {
    createMsg("primary", "processing Given Data")
    var formData = new FormData(document.querySelector("#postForm"));
    // var item = database.ref(`ads/catogaries/${formData.get('category')}`).push()
    // var productKey = item.key;
    var img = document.querySelector('#photoSelect').files[0]
    if (!img) {
        createMsg("danger", "Image Is Required");
        return false
    }
    storage.ref(`adsImg/${formData.get('category')}/${img.name + Math.random()}`).put(img)
        .then((snapShot) => {
            return snapShot.ref.getDownloadURL();
        })
        .then((url) => {
            fetch(`${url}/post-ad.html`, {
                method: "POST",
                headers: {
                    "Accept": 'application/json',
                    "Content-type": 'application/json',
                    "x-auth": token
                },
                body: JSON.stringify({
                    category: formData.get("category"),
                    src: url,
                    adDate: (new Date()).toDateString(),
                    price: formData.get("price"),
                    model: formData.get('model'),
                    title: formData.get("title"),
                    description: formData.get("description")
                })
            }).then((res) => {
                return res.json()
            }).then((result) => {
                console.log(result);
                if (!result.errors) {
                    createMsg("success", "Posted Successfully")
                    document.querySelector("#postForm").reset();
                    document.querySelector('#picShow').src = 'images/upload.png'
                } else {
                    throw result
                }
            }).then(() => {
                database.ref("notifications/notification").set({
                    posterName: crrUserData.name,
                    productImg: url,
                    category: formData.get("category"),
                    msgDate: (new Date()).toLocaleDateString(),
                    msgTime: (new Date()).toLocaleTimeString(),
                })
            }).catch((err) => {
                var errors = err.errors;
                for (var err in errors) {
                    createMsg('danger', err + ' : ' + errors[err].message)
                    console.log("err:", err)
                }
            })
        })
        .catch((err) => {
            console.log(err);
            createMsg("danger", err.message)
        })

}
//***************************UserCreation And Login************************//

//****************************SignUp*******************//
function signUpUser() {
    createMsg("primary", "Processing Your Information")
    var form = new FormData(document.querySelector("#signUpForm"));
    var img = document.querySelector('#imgPicker').files[0]
    if (!img) {
        createMsg("danger", "User Image Is Required")
        return false;
    }
    storage.ref(`userImg/${img.name + Math.random()}`).put(img)
        .then((snapShot) => {
            return snapShot.ref.getDownloadURL();
        }).then((imgUrl) => {
            fetch(`${url}/register.html`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.get('username'),
                    email: form.get('email'),
                    password: form.get("password"),
                    contact: form.get("contact"),
                    userImg: imgUrl
                })
            }).then((res) => {
                return res.json()

            }).then((result) => {
                if (!result.errors) {
                    console.log(result);
                    createMsg("success", "Your Account Is Successfully Created");
                    document.querySelector("#signUpForm").reset();
                    document.querySelector('#userImg').src = 'images/userImg.jpg'
                    setTimeout(() => {
                        window.location.href = 'login.html'
                    }, (2000))
                } else {
                    throw result;
                }
            }).catch((e) => {
                var errors = e.errors;
                for (var err in errors) {
                    createMsg('danger', err + ' : ' + errors[err].message)
                    console.log("err:", err)
                }
            })

        }).catch((err) => {
            createMsg("danger", "You Must Be Online To SignUp")
            console.log(err);
        })

}
//signIn***************************
function signInUser() {
    let form = new FormData(document.querySelector('#signInForm'));
    console.log(form.get('email'),form.get('password'));
    fetch(`${url}/login.html`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-type": 'application/json'
        },
        body: JSON.stringify({
            email: form.get('email'),
            password: form.get("password")
        })
    }).then((res) => {
        localStorage.setItem("_t", res.headers.get('x-auth'));
        return res.json();
    }).then((result) => {
        if (!result.errors) {
            createMsg("success", "Successfully Logged In");
            document.querySelector("#signInForm").reset();
            setTimeout(() => {
                window.location.href = 'index.html'
            }, (2000))
        } else {
            throw result;
        }
    }).catch((e) => {
        var errors = e.errors;
        for (var err in errors) {
            createMsg('danger', err + ' : ' + errors[err].message)
            console.log("err:", err)
        }
    })
}

function signOut() {
    fetch('/logout', {
        headers: {
            "x-auth": token
        }
    }).then(() => {
        localStorage.removeItem("_t")
        location.reload();
    })
}
//
//******************************global***********************//







//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//





//LOADERS****************
function initiateLoader() {
    var list = document.querySelector(`.load`);
    if (list) {
        var div = document.createElement('div');
        div.className = 'lds-facebook loader'
        div.innerHTML = `
       <div></div><div></div><div></div>
       `
        list.appendChild(div);
    }
}
function removeLoader() {
    if (document.querySelector('.loader')) {
        document.querySelector('.load').removeChild(document.querySelector('.loader'))
    }
}


//createUserTray********************
function createUserTray(userData) {
    return `
            <div>
            <div class='displayBoxImg animated fadeInRight'>
            <a href='JavaScript:void(0)' id='userLink' style='display:block' >
            <img src = "${userData.userImg}" title=${userData.name} style='margin-top:5px;' alt = "user" id = 'activeUserImg'/></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'buy.html' title='Messages'><i class="fas fa-shopping-cart fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'myAds.html' title='My Ads'><i class="fa fa-list fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'fav.html' title='My Favourites'><i class="fa fa-star fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'JavaScript:void(0)' title='Sign Out' onclick='signOut()'><i class="fas fa-power-off fa-lg"></i></a>
            </div>
            </div>
            
            `
}


//CreateMsg*****************
function createMsg(status, message) {
    if (document.querySelector('#infoMsg')) {
        document.body.removeChild(document.querySelector('#infoMsg'));
    }
    var p = document.createElement("p");
    p.className = `infoMsg ${status} animated fadeInDown`
    p.id = 'infoMsg';
    p.setAttribute('align', 'center')
    p.innerHTML = `
    <strong>${message}</strong>`
    document.body.appendChild(p);
    setTimeout(function () {
        document.querySelector("#infoMsg").classList += 'animated fadeOutUp'
    }, (3000))
}

//imageShow****************

function showImg(imageView, imageReader) {
    var picPreview = document.querySelector(`#${imageView}`);
    var inputFile = document.querySelector(`#${imageReader}`).files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        picPreview.src = reader.result;
    }, false);
    if (inputFile) {
        reader.readAsDataURL(inputFile);
    }
}


//********************Global-Ad-Creator*******************************//
function createAd(data) {
    var adData = JSON.stringify(data)
    return `
        <div class="col-sm-4 col-6  img-thumbnail cardDiv animated fadeIn" style='margin-bottom:5px;height:310px;'>
		<div class="card ">
			<div class="user-card-profile  text-center">
				<img class="" style='width:200px;height:150px;' src="${data.src}" alt="">
			</div>
			<div class="designation m-t-27 m-b-27 text-center">
				<h4> ${data.title}</h4>
			</div>
			<div class='adCont'>
				<div class='col-sm-6 col-xs-6 text-left adDiv'>
					<ul class='adUl'>
						<li>
							<i class="fas fa-money-check-alt"></i> Price</li>
						<li>
							<i class='fa fa-phone'></i> Contact</li>
					</ul>
				</div>
				<div class='col-sm-6 col-xs-6 text-right adDiv'>
					<ul class='adUl'>
						<li>${data.price} PKR</li>
						<li>${data.contact}</li>
					</ul>
				</div>
				<div class=' text-center adDateData'>
					<div class='col-sm-12 '>
                        <i class="far fa-clock"></i> ${data.adDate}
                    </div>
                </div>
					<div class='col-sm-12 detailBtn '>
						<a href='JavaScript:void(0)' class='btn btn-success' onclick='showAd(${adData})'>View Details</a>
                    </div>                    
				</div>
			</div>
		</div>
	</div>
	</div>
`
}
function showAd(adData) {
    localStorage.setItem("ad", JSON.stringify(adData))
    window.location.href = '/showAd.html'
}
function createAdDetails() {
    var data = JSON.parse(localStorage.getItem("ad"));
    console.log(data);
    var div = document.createElement("div");
    div.innerHTML = `
    <div id="page-wrapper" class="sign-in-wrapper">
            <div class="graphs" style="text-align:center;background:rgb(243, 243, 243)">
                <a href="${data.src}" target="_blank">
                    <img src="${data.src}" alt="pic" id="adImg">
                </a>
                <div class="adDetails">
                    <h1>${data.title}</h1>
                    <p>"${data.model}"</p>
                    <hr>
                    <h1>Description</h1>
                    <p class="des">"${data.description}"</p>
                    <div class="adData">
                        <div>
                            <span class="left">
                                <i class="fas fa-money-check-alt"></i> Price
                            </span>
                            <span class="right">
                                ${data.price}PKR
                            </span>
                        </div>
                        <div>
                            <span class="left">
                                <i class="fa fa-tag"></i> Category
                            </span>
                            <span class="right">
                                ${data.category}
                            </span>
                        </div>
                        <div>
                            <span class="left">
                                <i class='fa fa-phone'></i> Contact
                            </span>
                            <span class="right">
                                ${data.contact}
                            </span>
                        </div>
                        <div>
                            <span class="left">
                                <i class="fa fa-calendar" aria-hidden="true"></i> Published
                            </span>
                            <span class="right">
                                ${data.adDate}
                            </span>
                        </div>



                    </div>
                </div>
                <div class='newBtn'>
                    <button type="button" class="btn btn-info"  >
                        <i class="fas fa-envelope"></i> Chat</button>
                    <button type="button" class="btn btn-success" onclick="return addToFav('${data._id}')">
                        <i class="far fa-star"></i> Favourit</button>
                </div>

            </div>
    `
    document.getElementById('view').appendChild(div)
}