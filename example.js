var config = {
    pathToPackage: "node_modules/leaderboardsdk",
    container: ".screen",
    game: "Mario",
    eventHandlers: {
        onClickNewGameBtn: function() {}
    }
};
modalWindow.init(config);
modalWindow.show("Edward Example", 0);