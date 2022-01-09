(function () {
    var curPlayer = "playerA";
    var slots = $(".slot");
    var max = 4;
    var curLeft = $(".column").eq(3).offset().left + 9 + "px";
    var curALeft = $(".column").eq(3).offset().left + 9 - 50 + "px";
    var curPlayerColor = "#ff4500";

    $(".b-turn").hide();

    function randomPos(max) {
        return Math.floor(Math.random() * max) + "px";
    }

    function intro() {
        var circles = $(".circle");
        var maxW = $(window).width() - circles.eq(0).width();
        var maxY = $(window).height() - circles.eq(0).height();

        for (var i = 0; i < circles.length; i++) {
            circles.eq(i).css({
                left: randomPos(maxW),
                top: randomPos(maxY),
            });
        }
    }

    intro();

    function playAudio(sound) {
        sound.play();
    }

    $("#victory").hide();
    $(".chip").css({
        left: curLeft,
    });
    $(".player-hand-a").css({
        left: curALeft,
    });
    $(".player-hand-b").css({
        left: curLeft,
    });

    $("#start").on("click", function () {
        $("#intro").css({
            transform: "translateY(-100vh)",
        });

        $("#intro").delay(1000).fadeOut();

        startGame();
    });

    // keeping track on who's turn it is
    function switchPlayer() {
        if (curPlayer === "playerA") {
            curPlayer = "playerB";
            curPlayerColor = "#227bff";
            $(".player-hand-a")
                .addClass("player-hand-b")
                .removeClass("player-hand-a")
                .removeClass("open-hand-a");
        } else {
            curPlayer = "playerA";
            curPlayerColor = "#ff4500";
            $(".player-hand-b")
                .addClass("player-hand-a")
                .removeClass("player-hand-b")
                .removeClass("open-hand-b");
        }
    }

    $(".column").on("mousemove", function (event) {
        $(event.currentTarget).css({
            backgroundColor: curPlayerColor + "8c",
        });
        $(event.currentTarget).prev().css({
            backgroundColor: "",
        });
        $(event.currentTarget).next().css({
            backgroundColor: "",
        });

        $(".chip").css({
            left: $(event.target).offset().left + 40 + "px",
        });
        $(".player-hand-a").css({
            left: $(event.target).offset().left + 40 - 50 + "px",
        });
        $(".player-hand-b").css({
            left: $(event.target).offset().left + 40 + "px",
        });
        curLeft = $(event.target).offset().left + 40 + "px";
        curALeft = $(event.target).offset().left + 40 - 50 + "px";
    });

    function noDblClick(element) {
        if (element.hasClass("clicked")) {
            return true;
        }

        // wait for one second to remove 'clicked' class
        element.addClass("clicked");
        setTimeout(function () {
            element.removeClass("clicked");
        }, 1000);

        return false;
    }

    // recognize which column got clicked
    function startGame() {
        $(".column").on("click", function (event) {
            if (noDblClick($(event.currentTarget))) {
                return;
            }

            var col = $(event.currentTarget);
            var slotsInCol = col.children();
            var dropChip;

            $(".player-hand-a").addClass("open-hand-a");
            $(".player-hand-b").addClass("open-hand-b");

            for (var i = slotsInCol.length - 1; i >= 0; i--) {
                var isSlotFree =
                    !slotsInCol.eq(i).hasClass("playerA") &&
                    !slotsInCol.eq(i).hasClass("playerB");

                if (isSlotFree) {
                    // found free slot, apply current player's class to free slot and exit
                    dropChip = i;
                    slotsInCol
                        .eq(i)
                        .addClass(curPlayer)
                        .css("backgroundColor", "rgba(0,0,0,0)");

                    break;
                }
            }

            // if column is full, return function before switching players!
            if (i === -1) {
                return;
            }

            var drop = document.getElementById("drop");

            $(".chip").css({
                top: slotsInCol.eq(dropChip).offset().top + 10 + "px",
            });

            $(".chip").on("transitionend", function () {
                slotsInCol
                    .eq(dropChip)
                    .css({ backgroundColor: curPlayerColor });
                slotsInCol
                    .eq(dropChip)
                    .children()
                    .css({ "box-shadow": "none" });

                playAudio(drop);

                // console.log($(event));
                $(".chip").remove();
                $("body").prepend(
                    "<div class='chip' style='display: none'></div> "
                );
                $(".chip").fadeIn();

                var slotsInRow = $(".row" + i);

                // check for victory before player switch
                // check if we have a victory in a column

                if (checkForVictory(slotsInCol)) {
                    // found a victory in col
                    announceVictory();

                    // check if we have a victory in a row
                } else if (checkForVictory(slotsInRow)) {
                    // found a victory in row
                    announceVictory();

                    // check if we have a diagonal victory
                } else if (checkForDiagVictory(slots)) {
                    announceVictory();
                } else {
                    switchPlayer();

                    $(event.currentTarget).css({
                        backgroundColor: curPlayerColor + "8c",
                    });

                    if (curPlayer === "playerA") {
                        $(".b-turn").removeClass("wiggle");
                        $(".a-turn").fadeIn();
                        $(".a-turn")
                            .addClass("wiggle")
                            .delay(200)
                            .queue(function () {
                                $(this).removeClass("wiggle").dequeue();
                            });
                        $(".b-turn").fadeOut();
                    } else {
                        $(".a-turn").fadeOut();
                        $(".a-turn").removeClass("wiggle");
                        $(".b-turn").fadeIn();
                        $(".b-turn")
                            .addClass("wiggle")
                            .delay(200)
                            .queue(function () {
                                $(this).removeClass("wiggle").dequeue();
                            });
                    }

                    setTimeout(function () {
                        $(".chip").fadeIn(200);
                    }, 200);
                }

                $(".chip").css({
                    left: curLeft,
                    backgroundColor: curPlayerColor,
                });
                $(".player-hand-a").css({
                    left: curALeft,
                });
                $(".player-hand-b").css({
                    left: curLeft,
                });
            });
        });
    }

    // function for win check
    function checkForVictory(slots) {
        var count = 0;

        for (var j = 0; j < slots.length; j++) {
            if (slots.eq(j).hasClass(curPlayer)) {
                // found a match

                count++;
                if (count === 4) {
                    slots.eq(j).addClass("highlight");
                    slots.eq(j - 1).addClass("highlight");
                    slots.eq(j - 2).addClass("highlight");
                    slots.eq(j - 3).addClass("highlight");

                    return true;
                }
            } else {
                count = 0;
            }
        }

        return false;
    }

    function checkIsNext(index) {
        var upCount = 0;
        var downCount = 0;
        var init = 0;
        var upArr = [];
        var downArr = [];

        function checkSteps() {
            var indexUp = index;
            var indexDown = index;

            for (var i = 5; i <= 5 * (max - 1); i += 5) {
                var check5 =
                    slots.eq(indexUp - 5).hasClass(curPlayer) &&
                    slots
                        .eq(indexUp - init)
                        .parent()
                        .prev()
                        .is(slots.eq(indexUp - 5).parent());

                if (check5) {
                    upArr.push(indexUp);
                    upCount++;
                }
                indexUp -= 5;
            }

            for (var j = 7; j <= 7 * (max - 1); j += 7) {
                var check7 =
                    slots.eq(indexDown - 7).hasClass(curPlayer) &&
                    slots
                        .eq(indexDown - init)
                        .parent()
                        .prev()
                        .is(slots.eq(indexDown - 7).parent());

                if (check7) {
                    downArr.push(indexDown);
                    downCount++;
                }
                indexDown -= 7;
            }
        }

        checkSteps();

        if (upCount === 3) {
            upArr.push(upArr[upArr.length - 1] - 5);
            for (var i = 0; i < upArr.length; i++) {
                slots.eq(upArr[i]).addClass("highlight");
            }
            return true;
        } else if (downCount === 3) {
            downArr.push(downArr[downArr.length - 1] - 7);
            for (var j = 0; j < downArr.length; j++) {
                slots.eq(downArr[j]).addClass("highlight");
            }
            return true;
        }
    }

    function checkForDiagVictory(slots) {
        for (var k = 0; k < slots.length; k++) {
            if (slots.eq(k).hasClass(curPlayer)) {
                // check whether it is next

                if (checkIsNext(k)) {
                    return true;
                }
            }
        }
    }

    function announceVictory() {
        var playerAHtml = "Player A";
        var playerBHtml = "Player B";

        $(".chip").hide();

        function translateHtml() {
            return curPlayer === "playerA" ? playerAHtml : playerBHtml;
        }

        $(".column").off("click");

        if (curPlayer === "playerA") {
            $("#victory").css({
                backgroundColor: "orangered",
            });
        } else {
            $("#victory").css({
                backgroundColor: "#227bff",
            });
        }

        $("#victory").delay(3000).fadeIn();
        $(".win-message").html(translateHtml() + " wins!");

        var claps = $(".clap");
        var maxW = $(window).width() - 120;
        var maxY = $(window).height() - 120;

        for (var i = 0; i < claps.length; i++) {
            claps.eq(i).css({
                left: randomPos(maxW),
                top: randomPos(maxY),
            });
        }

        var clapping = document.getElementById("clapping");
        setTimeout(function () {
            playAudio(clapping);
        }, 3000);

        // restart game?

        restart(curPlayer, curLeft, curALeft);
    }

    function restart(winner, left, aLeft) {
        $("#restart")
            .unbind("click")
            .bind("click", function () {
                curLeft = left;
                curALeft = aLeft;
                curPlayer = winner;

                $(".highlight").removeClass("highlight");

                $(".column").css({
                    backgroundColor: "",
                });

                $(".chip").show();
                $(".open-hand-a").removeClass("open-hand-a");
                $(".open-hand-b").removeClass("open-hand-b");

                $(".playerA").removeClass("playerA");
                $(".playerB").removeClass("playerB");
                $(".slot").css({ "background-color": "" });
                $(".hole").css({ "box-shadow": "" });
                $("#victory").fadeOut();

                $(".chip").css({
                    left: curLeft,
                    backgroundColor: curPlayerColor,
                });
                $(".player-hand-a").css({
                    left: curALeft,
                });
                $(".player-hand-b").css({
                    left: curLeft,
                });

                startGame();
            });
    }
})();
