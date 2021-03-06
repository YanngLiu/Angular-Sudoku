"use strict";
angular.module("sudokuApp", ["Game", "Grid", "Keyboard", "Timer", "Selector", "ImporterGame"]).controller("GameController", ["GameManager", "KeyboardService", "TimerService", function(a, b, c) {
    this.game = a, this.newGame = function() {
        b.init(), this.game.newGame(), this.startGame()
    }, this.startGame = function() {
        var a = this;
        b.on(function(b) {
            a.game.move(b)
        }), c.cb = function() {
            a.game.addSecond()
        }
    }, this.newGame()
}]), angular.module("Game", ["Grid"]).service("GameManager", ["$q","GridService", "$document", function(a, b, c) {
    this.grid = b.grid, this.level = "容易", this.seconds = 0, this.printableSeconds = 0, this.printableMinutes = 0, this.printableHours = 0, this.score = 0, this.timerRunning = !0, 
    this.tipsCount = 3 + Math.floor(6 * Math.random()),
    this.addSecond = function() {
        if(this.timerRunning){
            this.seconds++;
            this.refreshPrintableTimer();
        }
    }, this.openModal = function() {
        this.timerRunning = !1;
        var canvas = $("#canvas");
        canvas.show();
        fireworkInit();
        fireworkGameLoop();

        setTimeout(function () {
            $("#winmodal").modal();
        }, 4500);
        setTimeout(function () {
            canvas.hide();
        }, 5500);

    }, this.refreshPrintableTimer = function() {
        var a = function(a, b) {
            for (var c = "" + a; c.length < b;) c = "0" + c;
            return c
        };
        this.printableSeconds = a(this.seconds % 60, 2), this.printableHours = Math.floor(this.seconds / 3600), this.printableMinutes = a(Math.floor((this.seconds - 3600 * this.printableHours) / 60), 2)
    }, this.newGame = function() {
        var a;
        this.seconds = 0, this.score = 0, this.tipsCount = 3 + Math.floor(6 * Math.random()), b.buildNewGameBoard();
        var c;
        if ("容易" === this.level || "一般" === this.level) {
            if (b.maskBoardEasy(), "容易" === this.level)
                for (a = 0; 5 > a; a++) {
                    do c = Math.floor(81 * Math.random()); while (this.grid[c].masked === !1);
                    this.grid[c].masked = !1
                }
        } else if (b.maskBoard(), "困难" === this.level)
            for (a = 0; 4 > a; a++) {
                do c = Math.floor(81 * Math.random()); while (this.grid[c].masked === !1);
                this.grid[c].masked = !1
            }
        var d = 0,
            e = "";
        for (a = 0; 81 > a; a++, d++) e += this.grid[a].value + ", ", 8 === d && (e = "", d = -1);
        b.placeInitialFocus(), this.timerRunning = !0, this.refreshPrintableTimer();    
        b.welcomeSpin();
        return true; // to run updateSelector() too when user click new game button
    }, this.selectTile = function(a) {
        b.placeFocus(a)
    }, this.valueUsedOut = function(value) {
        return b.valueUsedOut(value);
    }, this.selectNumber = function(a) {
        var addScore = b.putNumber(a);
        b.clearWrongs(), b.checkWin() && (this.timerRuning = false, this.openModal());
        if(addScore){
            this.score += b.getStepScore();
        }
    }, this.importGame = function() {
        var input = angular.element('#gameValue').val();
        var tmp = input.split(',');
        var len = tmp.length;
        if(len != 81){
            return;
        }
        for (var i = 0; i < len; i++) {
            // row and column are exchanged
            b.putNumberXY(i % 9, Math.floor(i / 9), parseInt(tmp[i]));
        }
        b.clearWrongs();
        var btn= document.getElementsByClassName("btn-group");
        b.resolve(!btn[1].classList.contains("open"));
    }, this.exportGame = function() {
        var result = b.exportGame();
        angular.element('#gameValue').val(result);
    }, this.checkMinorWin = function() {
        b.checkMinorWin();
    }, this.updateSelector = function() {
        b.updateSelector();
    }, this.move = function(c) {
        var self = this;
        var e = function(game) {
            ("up" === c || "down" === c || "left" === c || "right" === c) && b.moveFocus(c);
            if(1 === c || 2 === c || 3 === c || 4 === c || 5 === c || 6 === c || 7 === c || 8 === c || 9 === c) {
                var addScore = b.putNumber(c);
                if(addScore){
                    self.score += b.getStepScore();
                }
                b.highlightSameNumber(), b.clearWrongs(), b.checkWin() && (game.timerRuning = false, game.openModal());
            }
            ("backspace" === c || "del" === c || 0 === c) && (b.remove(), b.highlightSameNumber(), b.clearWrongs());
            if( "del" === c){
                b.stopAnimation(false);
                b.updateSelector();
            }
        };
        return a.when(e(this))
    }, this.checkValues = function() {
        var c = function() {
            b.checkValues()
        };
        return a.when(c())
    }, this.inputGame = function() {
        var c = function() {
            b.inputGame()
        };
        return a.when(c())
    }, this.inputGameOver = function() {
        var c = function() {
            b.inputGameOver()
        };
        return a.when(c())
    }, this.tips = function() {
        var self = this; 
        var c = function() {
            b.tips();
            b.updateSelector();
            self.tipsCount--;
            self.score -= 2000;
        };
        return a.when(c())
    }
}]), Array.prototype.clear = function() {
    for (var a = this.length; a--;) this[a] = 0
}, angular.module("Grid", []).factory("TileModel", function() {
    var a = function(a, b) {
        this.x = a.x, this.y = a.y, this.value = b, this.masked = !1, this.userValue = null, this.focus = !1, this.wrong = !1, this.wrong = false, this.newTips = false, this.sameNumber=false, this.current = false, this.spin=true, this.inputError=false
    };
    return a
}).provider("GridService", function() {
    this.$get = ["TileModel", function(a) {
        this.grid = [], this.size = 9, this.emptyCellsCount = 0, this.prevTime=0, this.stepScore = 0, this.skipAnimation = false, this.focus = {
            x: 0,
            y: 0
        };
        var b = this;
        return this.newTile = function(b, c) {
            return new a(b, c)
        }, this.maskBoardEasy = function() {
            var a, b, c, d, e;
            for (a = 0; 3 > a; a++)
                for (b = 0; 3 > b; b++)
                    for (c = 0; 5 > c; c++) {
                        var f;
                        do f = Math.floor(9 * Math.random()), e = 3 * a + Math.floor(f / 3), d = 3 * b + f % 3; while (this.grid[this._coordinatesToPosition({
                                x: d,
                                y: e
                            })].masked);
                        this.grid[this._coordinatesToPosition({
                            x: d,
                            y: e
                        })].masked = !0
                    }
        }, this.placeInitialFocus = function() {
            this.focus.x = 0, this.focus.y = 0, this.refreshFocus()
        }, this.welcomeSpin = function() {
            this.emptyCellsCount = 0;
            for (var a = 0; 81 > a; a++){
                if(!this.grid[a].masked){
                    // only spin cell which has intial value.
                    this.grid[a].spin = true;
                }else{
                    this.emptyCellsCount++;
                }
            }
        }, this.stopAnimation = function(skipInputError) {
            for (var a = 0; 81 > a; a++){
                this.grid[a].spin = false;
                if(!skipInputError){
                    this.grid[a].inputError = false;
                }
            }
        }, this.refreshFocus = function() {
            this.stopAnimation(false);
            var current = this.grid[this._coordinatesToPosition({
                x: this.focus.x,
                y: this.focus.y
            })];
            // hightlight conflict area only if there is no user input
            if(current.masked && current.userValue == null){
                for (var a = 0; 9 > a; a++){
                    for (var b = 0; 9 > b; b++) {
                        var tmp = this.grid[this._coordinatesToPosition({
                            x: a,
                            y: b
                        })];
                        var value = false;
                        if(a == this.focus.x || b == this.focus.y){
                            // same row or column
                            value = true;
                        }else if(Math.floor(a/3) == Math.floor(this.focus.x/3) && Math.floor(b/3) == Math.floor(this.focus.y/3)){
                            // same small grid
                            value = true;
                        }
                        if(tmp.masked && tmp.userValue==null){
                            // if there is no user input, skip it, but question itself should be included, which is also no user input
                            value = false;
                        }
                        tmp.focus = value;
                        tmp.current = false;
                    }
                }
            } else {
                for (var a = 0; 9 > a; a++){
                    for (var b = 0; 9 > b; b++) {
                        var tmp = this.grid[this._coordinatesToPosition({
                            x: a,
                            y: b
                        })];
                        tmp.focus = false;
                        tmp.current = false;
                    }
                }
            }
            current.focus = false;
            current.current = true;
            this.highlightSameNumber();
        }, this.highlightSameNumber = function() {
            var current = this.grid[this._coordinatesToPosition({
                x: this.focus.x,
                y: this.focus.y
            })];
            var curValue = -1;
            if(current.masked){
                curValue = current.userValue;
                if(curValue == null){
                    curValue = -1;
                }
            }else{
                curValue = current.value;                        
            }
            // hightlight same number
            for (var a = 0; 9 > a; a++)
                for (var b = 0; 9 > b; b++) {
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: a,
                        y: b
                    })];
                    // assign same value attribute
                    var tmpValue = null;
                    if(tmp.masked){
                        tmpValue = tmp.userValue;
                    }else{
                        tmpValue = tmp.value;                        
                    }

                    if(tmpValue == curValue && !tmp.wrong){
                        tmp.sameNumber = true;
                    } else {
                        tmp.sameNumber = false;
                    }
                    tmp.newTips = false;
            }
        }, this.checkMinorWin = function() {
            if(!this.validGame()){
                // if there is any wrong answer, cancel minor celebration.
                this.stopAnimation(true);
                return;
            }

            // Check row           
            var full = true; 
            for (var a = 0; 9 > a; a++){
                var tmp = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: this.focus.y
                })];
                if(tmp.masked && tmp.userValue ==null){
                    full = false;
                    break;
                }
            }
            if(full){
                for (var a = 0; 9 > a; a++){
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: a,
                        y: this.focus.y
                    })];
                    tmp.spin = true;
                }
            }

            // Check column           
            var full = true; 
            for (var b = 0; 9 > b; b++){
                var tmp = this.grid[this._coordinatesToPosition({
                    x: this.focus.x,
                    y: b
                })];
                if(tmp.masked && tmp.userValue ==null){
                    full = false;
                    break;
                }
            }
            if(full){
                for (var b = 0; 9 > b; b++){
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: this.focus.x,
                        y: b
                    })];
                    tmp.spin = true;
                }
            }

            // Check minor grid           
            var full = true; 
            for (var a = Math.floor(this.focus.x/3) * 3; Math.floor(this.focus.x/3) * 3 + 3 > a; a++){
                for (var b = Math.floor(this.focus.y/3) * 3; Math.floor(this.focus.y/3) * 3 + 3 > b; b++) {
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: a,
                        y: b
                    })];
                    if(tmp.masked && tmp.userValue ==null){
                        full = false;
                        break;
                    }
                }
            }
            if(full){
                for (var a = Math.floor(this.focus.x/3) * 3; Math.floor(this.focus.x/3) * 3 + 3 > a; a++){
                    for (var b = Math.floor(this.focus.y/3) * 3; Math.floor(this.focus.y/3) * 3 + 3 > b; b++) {
                        var tmp = this.grid[this._coordinatesToPosition({
                            x: a,
                            y: b
                        })];
                        tmp.spin = true;
                    }
                }
            }
        }, this.putNumber = function(a) {
            var tmp = 
                this.grid[this._coordinatesToPosition({
                    x: this.focus.x,
                    y: this.focus.y
                })];
            var oldValue = tmp.userValue;
            tmp.userValue = a;
            if(!this.validGame() && tmp.masked){
                tmp.inputError = true;
                var self = this;
                setTimeout(function () {
                    tmp.inputError = false;
                    self.checkValues();
                }, 500);
            }
            this.highlightSameNumber();
            this.checkMinorWin();
            this.updateSelector();

            if(tmp.userValue == tmp.value){
                this.givePraise(false);
            }else{
                this.givePraise(true);
            }

            if(tmp.masked){
                // user input different value and not in inputGame mode
                // TODO need to reset the score when input is over.
                return !this.skipAnimation && oldValue != a;
            }else{
                return false;
            }

        }, this.givePraise = function(minus) {
            if(this.skipAnimation){
                return;
            }
            var praise = $('#praise');
            var className = "#tile-" + this.focus.x + "-" + this.focus.y;
            var curTile = angular.element(className)[0];
            var newPos= this.getPos(curTile);
            angular.element('#stepScore')[0].innerHTML=(minus?"":"+")+this.computeStepScore(minus);
            if(minus){
                angular.element('#praiseIcon')[0].src="img/icon/sorry.gif";
                praise.css({color:"blue"});
            } else {
                angular.element('#praiseIcon')[0].src="img/icon/great.gif";
                praise.css({color:"red"});
            }
            praise.css({top:newPos.y - 70, left: newPos.x - 50, position:"absolute", display: "block", zIndex:"1"});
            praise.removeClass('scaleOut');
            setTimeout(function () {
                praise.toggleClass('scaleOut');
                setTimeout(function () {
                    praise.removeClass('hidden');
                    setTimeout(function () {
                        praise.toggleClass('hidden');
                    }, 1050);
                }, 10);
            }, 10);
        }, this.getPos = function(el) {
            for (var lx=0, ly=0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
            return {x: lx,y: ly};
        }, this.getGameTime = function() {
            var res = angular.element('#timerEclipsed')[0].innerHTML;
            var tmp = res.split(':');
            res = tmp[0]*3600 + tmp[1]*60+tmp[2];
            return parseInt(res);
        }, this.getStepScore = function(minus) {
            return this.stepScore;
        }, this.computeStepScore = function(minus) {
            var difficultyScore = 27;
            var timeScore = 20;
            var difficultyPenalty = 7;
            var timePenalty = 9;
            var reasonableTimeNeeded = 3 * 60;
            // There is just few unifinished, things become easy again.
            var difficultyEasyAgain = 10;

            var unfinished = 0;
            for (var a = 0; 81 > a; a++){
                if(this.grid[a].masked && this.grid[a].userValue != this.grid[a].value){
                    unfinished++;
                }
            }

            var curTime = this.getGameTime();
            var stepUsedSeconds = curTime - this.prevTime;
            this.prevTime = curTime;

            var cellDifficulty = this.emptyCellsCount - unfinished + 1;
            if(unfinished <= difficultyEasyAgain){
                cellDifficulty = unfinished; 
            }
            var res = cellDifficulty * difficultyScore + (reasonableTimeNeeded - stepUsedSeconds) * timeScore;

            // at least 521 if user use too many time, assuming 3 minutes are enough
            if(res < 0){
                res = 521;
            }

            // if user input error
            if(minus){
                res = (unfinished - cellDifficulty) * difficultyPenalty + stepUsedSeconds * timePenalty;
                res *= -1;

                // at most case
                if(res < -522){
                    res = -522;
                }
            }

            this.stepScore = res;

            return res;
        }, this.updateSelector = function() {
            var numberCnt = [];
            for(var i = 0; i < this.size + 1; i++){
                numberCnt.push(0);
            }


            for(var i = 0; i < this.size * this.size; i++){
                var target = 0;
                if(this.grid[i].masked){
                    target = this.grid[i].userValue;
                }else{
                    target = this.grid[i].value;
                }
                numberCnt[target]++;                    
            }

            for(var i = 1; i < this.size + 1; i++){
                var id = '#selectable-tile-' + i;
                angular.element(id)[0].innerHTML = (numberCnt[i] == this.size ? ' ': i);
            }

        }, this.putNumberXY = function(xx, yy, a) {
            var cell = this.grid[this._coordinatesToPosition({
                x: xx,
                y: yy
            })];
            if(!isNaN(a)){
                cell.userValue = a;
                cell.masked = false;
                cell.value = a;
            } else {
                cell.userValue = null;
                cell.masked = true;
                cell.value = null;
            }
            cell.focus = false;
            cell.sameNumber = false;
            this.updateSelector();
            
        }, this.isValid = function(i, j , c) {
            // Check colum
            for (var row = 0; row < 9; row++){
                var tmp = this.grid[this._coordinatesToPosition({
                    x: row,
                    y: j
                })];

                if (tmp.value == c)
                    return false;
            }
     
            // Check row
            for (var col = 0; col < 9; col++){
                var tmp = this.grid[this._coordinatesToPosition({
                    x: i,
                    y: col
                })];

                if (tmp.value == c)
                    return false;
            }
     
            // Check 3 x 3 block
            for (var row = Math.floor((i / 3)) * 3; row < Math.floor((i / 3)) * 3 + 3; row++){
                for (var col = Math.floor((j / 3)) * 3; col < Math.floor((j / 3)) * 3 + 3; col++){
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: row,
                        y: col
                    })];

                    if (tmp.value == c)
                        return false;
                }
            }
            return true;
        }, this.resolve = function(showAnswer) {
            if(!this.validGame()){
                // resolve a wrong game, will cost lots of time.
                return;
            }
            this.resolveDetail(showAnswer);
        }, this.resolveDetail = function(showAnswer) {
            for (var a = 0; 9 > a; a++){
                for (var b = 0; 9 > b; b++) {
                    var tmp = this.grid[this._coordinatesToPosition({
                        x: a,
                        y: b
                    })];
                    if(tmp.value==null){
                        for (var c = 1; c <= 9; c++) {
                            // trial. Try 1 through 9 for each cell
                            if (this.isValid(a, b, c)) {
                                tmp.value = c; // Put c for this cell
                                if(showAnswer){
                                    tmp.userValue = c;
                                }
                                if (this.resolveDetail(showAnswer))
                                    return true; // If it's the solution return true
                                else{
                                    tmp.value = null; // Otherwise go back
                                    if(showAnswer){
                                        tmp.userValue = null;
                                    }
                                }
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }, this.remove = function() {
            this.grid[this._coordinatesToPosition({
                x: this.focus.x,
                y: this.focus.y
            })].userValue = null
        }, this.placeFocus = function(a) {
            this.focus = a, this.refreshFocus()
        }, this.valueUsedOut = function(value) {
            var cnt = 0;
            for(var i = 0; i < 81; i++){
                var target = 0;
                if(this.grid[i].masked){
                    target = this.grid[i].userValue;
                }else{
                    target = this.grid[i].value;
                }
                if(target == value){
                    cnt++;
                }
            }
            return cnt == this.size;
        }, this.moveFocus = function(a) {
            "down" === a && this.focus.y < 8 && this.focus.y++, "up" === a && this.focus.y > 0 && this.focus.y--, "right" === a && this.focus.x < 8 && this.focus.x++, "left" === a && this.focus.x > 0 && this.focus.x--, this.refreshFocus()
        }, this.buildNewGameBoard = function() {
            for (var a, b, c, d = this, e = new Array(81), f = 0; 9 > f; f++)
                for (var g = 0; 9 > g; g++) e[9 * f + g] = (3 * f + Math.floor(f / 3) + g) % 9 + 1;
            for (f = 0; 42 > f; f++) {
                var h, i = Math.ceil(9 * Math.random());
                do h = Math.ceil(9 * Math.random()); while (i === h);
                for (a = 0; 9 > a; a++)
                    for (c = 0; c > c; c++) e[9 * a + c] === i ? e[9 * a + c] = h : e[9 * a + c] === h && (e[9 * a + c] = i)
            }
            for (var j = 0; 42 > j; j++) {
                var k = Math.floor(3 * Math.random()),
                    l = Math.floor(3 * Math.random());
                for (a = 0; 9 > a; a++) b = e[9 * a + (3 * k + j % 3)], e[9 * a + (3 * k + j % 3)] = e[9 * a + (3 * l + j % 3)], e[9 * a + (3 * l + j % 3)] = b
            }
            for (var m = 0; 42 > m; m++) {
                var n = Math.floor(3 * Math.random()),
                    o = Math.floor(3 * Math.random());
                for (a = 0; 9 > a; a++) b = e[9 * a + (m % 3 * 3 + n)], e[9 * a + (m % 3 * 3 + n)] = e[9 * a + (m % 3 * 3 + o)], e[9 * a + (m % 3 * 3 + o)] = b
            }
            for (m = 0; 42 > m; m++) {
                var p = Math.floor(3 * Math.random()),
                    q = Math.floor(3 * Math.random());
                for (c = 0; 9 > c; c++) b = e[9 * (m % 3 * 3 + p) + c], e[9 * (m % 3 * 3 + p) + c] = e[9 * (m % 3 * 3 + q) + c], e[9 * (m % 3 * 3 + q) + c] = b
            }
            for (var r = 0; 9 > r; r++)
                for (var s = 0; 9 > s; s++) d.setCellAt({
                    x: r,
                    y: s
                }, e[9 * s + r])
        }, this.setCellAt = function(a, b, c) {
            c || (c = !1);
            var d = this._coordinatesToPosition(a);
            this.grid[d] = this.newTile(a, b)
        }, this.buildEmptyGameBoard = function() {
            for (var a = this, c = 0; c < b.size * b.size; c++) this.grid[c] = null;
            this.forEach(function(b, c) {
                a.setCellAt({
                    x: b,
                    y: c
                }, c)
            })
        }, this._coordinatesToPosition = function(a) {
            return a.y * b.size + a.x
        }, this._positionToCoordinates = function(a) {
            var c = a % b.size,
                d = (a - c) / b.size;
            return {
                x: c,
                y: d
            }
        }, this.forEach = function(a) {
            for (var c = b.size * b.size, d = 0; c > d; d++) {
                var e = this._positionToCoordinates(d);
                a(e.x, e.y, this.grid[d])
            }
        }, this
    }], this.checkWrong = function(a, b, c) {
        var d = this.grid[this._coordinatesToPosition({
            x: a,
            y: b
        })];
        return d.value === c && d.masked === !1 || d.userValue === c && d.masked === !0 ? !0 : void 0
    }, this.checkVal = function(a, b, c) {
        var d, e, f, g;
        for (d = 0; 9 > d; d++)
            if (d !== b && this.checkWrong(a, d, c)) return false;
        for (d = 0; 9 > d; d++)
            if (d !== a && this.checkWrong(d, b, c)) return false;
        for (f = a - a % 3, g = b - b % 3, d = f; f + 3 > d; d++)
            for (e = g; g + 3 > e; e++)
                if ((d !== a || e !== b) && this.checkWrong(d, e, c)) return false;
        return true
    }, this.checkValues = function() {
        for (var a = 0; 9 > a; a++)
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                // include system cell, as it maybe user input and wrong
                if(/*c.masked && */c.userValue){
                    if (!this.checkVal(a, b, c.userValue)){
                        c.wrong = true;
                        // make error color high priority
                        c.sameNumber = false;
                    }
                }
            }
    }, this.validGame = function() {
        this.clearWrongs();
        this.checkValues();

        for (var a = 0; 9 > a; a++){
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                if(c.wrong){
                    return false;
                }
            }        
        }
        return true;
    }, this.inputGame = function() {
        for (var a = 0; 9 > a; a++){
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                // clear all as user input one to enable input
                if(!c.masked){
                    c.userValue = c.value;
                }
                c.wrong = false;
                c.userValue = null;
                c.focus = false;
                c.current = false;
                c.sameNumber = false;
                c.masked = true;
                c.value = null;
            }
        }
        this.skipAnimation = true;
        this.focus.x = 0;
        this.focus.y = 0;
        this.grid[0].current = true;
        window.scrollTo(0, 0);
    }, this.inputGameOver = function() {
        for (var a = 0; 9 > a; a++){
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                // clear all as user input one to enable input
                if(c.userValue != null){
                    c.masked = false; // not masked is used in ng-if to select bigger font in css in tile.html
                    c.value = c.userValue;
                }
            }
        }
        this.resolve(false);
        this.skipAnimation = false;
    }, this.exportGame = function() {
        var result = "";
        for (var a = 0; 9 > a; a++){
            for (var b = 0; 9 > b; b++) {
                // row and column are exchanged
                var c = this.grid[this._coordinatesToPosition({
                    x: b,
                    y: a
                })];
                if(!c.masked){
                    // output the giving condition
                    result += c.value;
                }else if(c.userValue != null){
                // output the giving condition and filled
                    result += c.userValue;
                }
                if(a < 8 || b < 8){
                    // no comma in the end
                    result += ",";
                }
            }
            result += "\n";
        }
        return result;
    }, this.tips = function() {
        // give tips for the current cell
        for (var a = 0; 9 > a; a++){
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                if(c.current && c.masked && c.userValue != c.value){
                        c.userValue = c.value;
                        c.newTips = true; 
                        c.focus = false;
                        c.current = false;
                        return;
                }
            }
        }

        // otherwise give the first unfilled cell
        for (var a = 0; 9 > a; a++)
            for (var b = 0; 9 > b; b++) {
                var c = this.grid[this._coordinatesToPosition({
                    x: a,
                    y: b
                })];
                if(c.masked){
                    // user can input
                    if(c.userValue == null || c.userValue != c.value){
                        // user did not input or input is error
                        c.userValue = c.value;
                        //highlight it
                        c.newTips = true; // choose .tile.newTips in css via ng-class in tile.html
                        c.focus = false;
                        c.current = false;
                        this.focus.x = a;
                        this.focus.y = b;
                        this.refreshFocus();
                        return;
                    }
                }
            }
    }, this.clearWrongs = function() {
        for (var a = 0; 9 > a; a++)
            for (var b = 0; 9 > b; b++) this.grid[this._coordinatesToPosition({
                x: a,
                y: b
            })].wrong = !1
    }, this.maskBoard = function() {
        var a, b, c, d, e, f, g, h, i = 0,
            j = 0,
            k = new Array(9);
        k.clear();
        var l = new Array(81);
        l.clear();
        var m = new Array(81);
        for (a = 0; 81 > a; a++) m[a] = this.grid[a].value;
        var n = new Array(81);
        n.clear();
        do {
            do g = Math.floor(81 * Math.random()); while (0 !== n[g] || 0 !== l[g]);
            if (h = m[g], a = this.getAvailable(n, g, null), a > 1) {
                var o, p = Math.floor(g / 9),
                    q = g % 9;
                for (o = 0, a = 0; 9 > a; a++)
                    if (a !== q && (b = 9 * p + a, !(n[b] > 0)))
                        for (f = this.getAvailable(n, b, k), b = 0; f > b; b++) {
                            if (k[b] === h) {
                                o++;
                                break
                            }
                            k[b] = 0
                        }
                if (o > 0) {
                    for (o = 0, a = 0; 9 > a; a++)
                        if (a !== p && (b = 9 * a + q, !(n[b] > 0)))
                            for (f = this.getAvailable(n, b, k), b = 0; f > b; b++) {
                                if (k[b] === h) {
                                    o++;
                                    break
                                }
                                k[b] = 0
                            }
                    if (o > 0) {
                        for (o = 0, d = p - p % 3, e = q - q % 3, a = d; d + 3 > a; a++)
                            for (b = e; e + 3 > b; b++)
                                if (!(a === p && b === q || (c = 9 * a + b, n[c] > 0)))
                                    for (f = this.getAvailable(n, c, k), c = 0; f > c; c++) {
                                        if (k[c] === h) {
                                            o++;
                                            break
                                        }
                                        k[c] = 0
                                    }
                        o > 0 && (n[g] = h, j++)
                    }
                }
            }
            l[g] = 1, i++
        } while (81 > i);
        do {
            do g = Math.floor(81 * Math.random()); while (0 === n[g] || 0 === l[g]);
            h = n[g];
            var r = 0;
            n[g] = 0, r = this.enumSolutions(n), r > 1 && (n[g] = h), l[g] = 0, j--
        } while (j > 0);
        for (a = 0; 81 > a; a++) this.grid[a].masked = n[a] > 0 ? !1 : !0
    }, this.getAvailable = function(a, b, c) {
        var d, e, f, g, h, i, j = new Array(9);
        for (j.clear(), f = Math.floor(b / 9), g = b % 9, d = 0; 9 > d; d++) e = 9 * f + d, a[e] > 0 && (j[a[e] - 1] = 1);
        for (d = 0; 9 > d; d++) e = 9 * d + g, a[e] > 0 && (j[a[e] - 1] = 1);
        for (h = f - f % 3, i = g - g % 3, d = h; h + 3 > d; d++)
            for (e = i; i + 3 > e; e++) a[9 * d + e] > 0 && (j[a[9 * d + e] - 1] = 1);
        if (e = 0, null === c) {
            for (d = 0; 9 > d; d++) 0 === j[d] && e++;
            return e
        }
        for (d = 0; 9 > d; d++) 0 === j[d] && (c[e++] = d + 1);
        if (0 === e) return 0;
        for (d = 0; 18 > d; d++) h = Math.floor(Math.random() * e), i = Math.floor(Math.random() * e), f = c[h], c[h] = c[i], c[i] = f;
        return e
    }, this.enumSolutions = function(a) {
        var b, c, d = 0,
            e = this.getCell(a);
        if (-1 === e) return 1;
        var f = new Array(9);
        for (f.clear(), c = this.getAvailable(a, e, f), b = 0; c > b && (a[e] = f[b], d += this.enumSolutions(a), !(d > 1)); b++);
        return a[e] = 0, d
    }, this.getCell = function(a) {
        var b, c, d = -1,
            e = 10,
            f = new Array(9);
        for (f.clear(), b = 0; 81 > b && (0 !== a[b] || (c = this.getAvailable(a, b, null), e > c && (e = c, d = b), 1 !== e)); b++);
        return d
    }, this.checkWin = function() {
        for (var a = 0; 81 > a; a++)
            if (this.grid[a].masked && parseInt(this.grid[a].userValue, 10) !== parseInt(this.grid[a].value, 10)) return !1;
        return !0
    }
}), angular.module("Grid").directive("grid", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ngModel: "="
        },
        templateUrl: "/sudoku/Angular-Sudoku/views/grid.html"
    }
}), angular.module("Grid").directive("tile", function() {
    return {
        restrict: "A",
        scope: {
            ngModel: "="
        },
        templateUrl: "/sudoku/Angular-Sudoku/views/tile.html"
    }
}), angular.module("Keyboard", []).service("KeyboardService", ["$document", function(a) {
    var b = "up",
        c = "right",
        d = "down",
        e = "left",
        f = "del",
        g = "backspace",
        h = {
            37: e,
            38: b,
            39: c,
            40: d,
            49: 1,
            50: 2,
            51: 3,
            52: 4,
            53: 5,
            54: 6,
            55: 7,
            56: 8,
            57: 9,
            48: 0,
            97: 1,
            98: 2,
            99: 3,
            100: 4,
            101: 5,
            102: 6,
            103: 7,
            104: 8,
            105: 9,
            96: 0,
            8: g,
            46: f
        };
    this.init = function() {
        var b = this;
        this.keyEventHandlers = [], a.bind("keydown", function(a) {
            var input = angular.element('#gameValue');
            if(input[0] === document.activeElement){
                // If the input element is selected, ignore the keyboard function
                return;
            }
            var c = h[a.which];
            c && (a.preventDefault(), b._handleKeyEvent(c, a))
        })
    }, this.on = function(a) {
        this.keyEventHandlers.push(a)
    }, this._handleKeyEvent = function(a, b) {
        var c = this.keyEventHandlers;
        if (c && (b.preventDefault(), c))
            for (var d = 0; d < c.length; d++) {
                var e = c[d];
                e(a, b)
            }
    }
}]), angular.module("Selector", []).directive("selector", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ngModel: "="
        },
        templateUrl: "/sudoku/Angular-Sudoku/views/selector.html"
    }
}),  angular.module("ImporterGame", []).directive("importergame", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ngModel: "="
        },
        templateUrl: "/sudoku/Angular-Sudoku/views/importergame.html"
    }
}), angular.module("Timer", []).service("TimerService", ["$timeout", function(a) {
    this.cb = null;
    var b = this,
        c = function() {
            b.cb(), a(c, 1e3)
        };
    a(c, 1e3)
}]);
