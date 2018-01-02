var modalWindow = {
    config: {},
    score: 0,

    init: function(config) {
        modalWindow.config = config;
        if (typeof $ === "undefined") {
            console.log("Leaderboard SDK requires jQuery");
        }
        $.get(modalWindow.config.pathToPackage + "/modal-window.html", function(modalWindowHtml) {
            $(modalWindow.config.container).append(modalWindowHtml);
            modalWindow.setEventHandlers();
        });
    },

    setEventHandlers: function() {
        document.querySelector(".modal-window__form").onsubmit = function(event) {
            event.preventDefault();
            var name = document.querySelector("#name").value;
            localStorage.name = name;
            modalWindow.showMessage(name);
        };

        document.querySelector("#new_game_button").onclick = function() {
            modalWindow.hide();
            modalWindow.config.eventHandlers.onClickNewGameBtn();
        };

        document.querySelector("#clear_name_button").onclick = function() {
            localStorage.removeItem("name");
            modalWindow.showForm();
        };
        document.querySelector("#save_score_button").onclick = function() {
            modalWindow.showScoreSaved(localStorage.name, modalWindow.score);
        };
    },

    resetElements: function() {
        document.querySelectorAll(".modal-window *").forEach(function(element) {
            element.removeAttribute("style");
        });
    },

    showElements: function(selectors) {
        selectors.forEach(function(selector){
            document.querySelector(selector).style.display = "block";
        });
    },

    show: function(name, score) {
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
        }
    },

    showMessage: function(name) {
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
    },

    hide: function() {
        modalWindow.resetElements();
        document.querySelector(".modal-window").style.display = "none";
    },

    showForm: function() {
        modalWindow.resetElements();
        modalWindow.showElements([".modal-window__form"]);
        document.querySelector("#name").value = "";
        document.querySelector("#name").focus();
    },

    showScoreSaved: function(name, score) {
        modalWindow.resetElements();
        modalWindow.showElements([".modal-window__loader-text"]);
        $.post(
            "http://leaderboard.local/ScoreController.php",
            {
                nick: name,
                game: modalWindow.config.game,
                score: score
            },
            function(response) {
                modalWindow.resetElements();
                modalWindow.showElements([".modal-window__saved-score-text", "#new_game_button"]);
                document.querySelector(".modal-window__saved-score-text .player-name")
                    .textContent = ", " + response.nick;
            },
            "json"
        ).fail(function(xhr) {
            var message = xhr.responseJSON ? xhr.responseJSON.message : "Unknown server error";
            console.log(xhr);
            modalWindow.resetElements();
            modalWindow.showElements([".modal-window__save-error-text", "#new_game_button"]);
            document.querySelector(".error-message").textContent = message;
        });
    }
};