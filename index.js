;
(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory)
    } else if (typeof exports === 'object') {
        module.exports = factory()
    } else {
        global.Index = factory()
    }
}(this, function() {
    var config = null
    var directAccess = false
    var gapiUrl = 'https://apis.google.com/js/api:client.js'

    var yAuth = {
        install: function(Vue, options) {
            Vue.youtubeAuth = youtubeAuth
            Vue.prototype.$youtubeAuth = youtubeAuth

            if (typeof options === 'object') {
                // config = Object.assign(options, { scope: 'https://www.googleapis.com/auth/youtube.readonly' })
                config = options;
            }
        }
    }

    function youtubeAuth() {
        return {
            load: function() {
                return new Promise(function(resolve, reject) {
                    if (window.gapi === undefined) {
                        installClient().then(function() {
                            return initClient()
                        }).then(function() {
                            resolve()
                        })
                    } else if (window.gapi !== undefined && window.gapi.auth2 === undefined) {
                        initClient().then(function() {
                            resolve()
                        })
                    }
                })
            },

            directAccess: function() {
                directAccess = true
            },

            signIn: function(successCallback, errorCallback) {
                if (directAccess) {
                    window.gapi.auth2.getAuthInstance().signIn().then(function(youtubeUser) {
                        successCallback(youtubeUser)
                    }, function(error) {
                        errorCallback(error)
                    })
                } else {
                    window.gapi.auth2.getAuthInstance().grantOfflineAccess({
                        'redirect_uri': 'postmessage',
                        prompt: 'select_account'
                    }).then(function(response) {
                        successCallback(response.code)
                    }, function(error) {
                        errorCallback(error)
                    })
                }
            },

            signOut: function(successCallback, errorCallback) {
                window.gapi.auth2.getAuthInstance().signOut().then(function() {
                    successCallback()
                }, function(error) {
                    errorCallback(error)
                })
            },

            getCurrentUser: function() {
                return window.gapi.auth2.getAuthInstance().currentUser.get();
            },

            getAuthInstance: function() {
                return window.gapi.auth2.getAuthInstance();
            }
        }
    }

    function installClient() {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script')
            script.src = gapiUrl
            script.onreadystatechange = script.onload = function() {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    setTimeout(function() {
                        resolve()
                    }, 500)
                }
            }
            document.getElementsByTagName('head')[0].appendChild(script)
        })
    }

    function initClient() {
        return new Promise(function(resolve, reject) {
            window.gapi.load('auth2', function() {
                window.gapi.auth2.init(config)
                resolve()
            })
        })
    }

    return yAuth
}))