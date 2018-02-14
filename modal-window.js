var modalWindow = {
    config: {},
    score: 0,
    apiUrl: "http://api.leaderboard.local/api/",

    init: function (config) {
        modalWindow.config = config;
        if (typeof $ === "undefined") {
            console.log("Leaderboard SDK requires jQuery");
        }
        $.get(modalWindow.config.pathToPackage + "/modal-window.html", function (modalWindowHtml) {
            $(modalWindow.config.container).append(modalWindowHtml);
            modalWindow.setEventHandlers();
        });
    },

    setEventHandlers: function () {
        document.querySelector(".modal-window__form").onsubmit = function (event) {
            event.preventDefault();
            var name = document.querySelector("#name").value;
            localStorage.name = name;
            modalWindow.showMessage(name);
        };

        document.querySelector("#new_game_button").onclick = function () {
            modalWindow.hide();
            modalWindow.config.eventHandlers.onClickNewGameBtn();
        };

        document.querySelector("#clear_name_button").onclick = function () {
            localStorage.removeItem("name");
            sessionStorage.removeItem("token");
            modalWindow.showForm();
        };
        document.querySelector("#save_score_button").onclick = function () {
            modalWindow.checkNameRegistered(localStorage.name);
        };
        document.querySelector("#navigate_to_login_button").onclick = function () {
            sessionStorage.removeItem("token");
            modalWindow.checkNameRegistered(localStorage.name);
        };
        document.querySelector("#change_name_button").onclick = function () {
            localStorage.removeItem("name");
            sessionStorage.removeItem("token");
            modalWindow.showForm();
        };
        document.querySelector(".modal-window__login-form").onsubmit = function (event) {
            event.preventDefault();
            modalWindow.login();
        }
    },

    resetElements: function () {
        document.querySelectorAll(".modal-window *").forEach(function (element) {
            element.removeAttribute("style");
        });
    },

    showElements: function (selectors) {
        selectors.forEach(function (selector) {
            document.querySelector(selector).style.display = "block";
        });
    },

    show: function (name, score) {
        modalWindow.score = score;
        document.querySelector(".modal-window").style.display = "block";
        modalWindow.resetElements();
        document.querySelector(".modal-window__score__value")
            .textContent = modalWindow.score;
        if (name === undefined) {
            modalWindow.showElements([".modal-window__form"]);
            document.querySelector("#name").focus();
        } else {
            modalWindow.showElements([
                ".modal-window__message",
                ".modal-window__thank-you-text",
                "#save_score_button",
                "#clear_name_button",
                "#new_game_button"
            ]);
            document.querySelector(".player-name")
                .textContent = (name == "") ? name : ", " + name;
            document.querySelector("#clear_name_button")
                .value = (sessionStorage.getItem("token")) ? "Logout" : "Clear Name";
        }
    },

    showMessage: function (name) {
        modalWindow.resetElements();
        modalWindow.showElements([
            ".modal-window__message",
            ".modal-window__thank-you-text",
            "#save_score_button",
            "#clear_name_button",
            "#new_game_button"
        ]);
        document.querySelector(".modal-window__thank-you-text .player-name")
            .textContent = (name == "") ? name : ", " + name;
        document.querySelector("#clear_name_button")
            .value = (sessionStorage.getItem("token")) ? "Logout" : "Clear Name";
    },

    hide: function () {
        modalWindow.resetElements();
        document.querySelector(".modal-window").style.display = "none";
    },

    showForm: function () {
        modalWindow.resetElements();
        modalWindow.showElements([".modal-window__form"]);
        document.querySelector("#name").value = "";
        document.querySelector("#name").focus();
    },

    checkNameRegistered: function (name) {
        if (name) {
            $.get(
                modalWindow.apiUrl + "player/" + name,
                [],
                function (response) {
                    if (response.activated_at && !sessionStorage.getItem("token")) {

                        modalWindow.resetElements();
                        modalWindow.showElements(['.modal-window__login-form'])
                    } else {
                        modalWindow.showScoreSaved(name, modalWindow.score);
                    }
                }
            )
        } else {
            modalWindow.showForm();
        }
    },

    login: function () {
        var email = document.querySelector("#email").value;
        var password = document.querySelector("#password").value;
        $.post(
            modalWindow.apiUrl + "login",
            {
                email: email,
                password: password
            },
            function (response) {
                sessionStorage.setItem("token", response.token);
                sessionStorage.setItem("player", JSON.stringify(response.player));
                modalWindow.showScoreSaved(response.player.name, modalWindow.score);
            }
        ).fail(
            function (xhr) {
                if (xhr.status == 401) {
                    window.alert(xhr.responseJSON.message);
                }
            }
        );
    },

    showScoreSaved: function (name, score) {
        modalWindow.resetElements();
        modalWindow.showElements([".modal-window__loader-text"]);
        var apiEndpoint = "rounds/save-without-account";
        if (sessionStorage.getItem("token")) {
            apiEndpoint = "rounds/save-with-account"
            $.ajaxSetup({
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token")
                }
            });
        }

        $.post(
            modalWindow.apiUrl + apiEndpoint,
            {
                name: name,
                game: modalWindow.config.game,
                score: score
            },
            function (response) {
                modalWindow.resetElements();
                modalWindow.showElements([".modal-window__saved-score-text", "#new_game_button"]);
                document.querySelector(".modal-window__saved-score-text .player-name")
                    .textContent = ", " + response.player.name;
                localStorage.name = response.player.name;
            },
            "json"
        ).fail(function (xhr) {
            var message = xhr.responseJSON ? xhr.responseJSON.message : "Unknown server error";
            modalWindow.resetElements();
            modalWindow.showElements([".modal-window__save-error-text", "#new_game_button"]);
            document.querySelector(".error-message").textContent = message;
            if (xhr.status == 401) {
                modalWindow.showElements(["#navigate_to_login_button"])
            }
        });
    }
};