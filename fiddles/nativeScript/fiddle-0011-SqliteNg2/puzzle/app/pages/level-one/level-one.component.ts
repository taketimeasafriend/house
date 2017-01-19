const Dialogs = require('ui/dialogs'),
  frame = require('ui/frame');

import {Component, OnInit} from '@angular/core';
import {View} from 'ui/core/view';
import {Router} from '@angular/router';
import {Page} from 'ui/page';
import {Color} from 'color';
import {RouterExtensions} from "nativescript-angular/router";

import {Base} from '../../base';
import {Config} from '../../shared/config';
import {Board} from '../../shared/board/board';
import {Square} from '../../shared/board/square';
import {BoardService} from '../../shared/board/board.service';
import {ScoreService} from '../../shared/score/score.service';
import {State} from '../../shared/state/State';
import {StateService} from '../../shared/state/state.service';


@Component({
  selector: 'level-one',
  templateUrl: 'pages/level-one/level-one.component.html',
  styleUrls: ['pages/level-one/level-one-common.css', 'pages/level-one/level-one.css'],
  providers: [BoardService, ScoreService, StateService]
})
export class LevelOneComponent extends Base implements OnInit {

  board: Board;
  isDev: Boolean;

  constructor(private _router: RouterExtensions,
              private _page: Page,
              private _boardService: BoardService,
              private _scoreService: ScoreService,
              private _stateService: StateService) {
    super();

    this.isDev = Config.isDev;

    this.subscriptions.push(_boardService.gameBoardChange$
      .subscribe(
        (board: any) => this.onGameBoardChange(board)
      ));

    this.subscriptions.push(_stateService.stateChange$
      .subscribe(
        (state: any) => this.onStateChange(state)
      ));

  }

  ngOnInit() {
    this.consoleLogMsg('level-one.component', 'ngOnInit');
    this.onInit();
  }

  onInit(): void {
    this.consoleLogMsg('level-one.component', 'onInitChange');
    this._boardService.initBoard(3, 3, Config.title + ' - Level 1', 1, 0, 'level-two');
  }

  onGameBoardChange(board: Board) {
    this.consoleLogMsg('level-one.component', 'onGameBoardChange');
    this.board = board;
    if (this._boardService.isGameOver()) {
      if (this._scoreService.isHighScore(this.board.moves, this.board.level)) {
        this.onHighScore();
      } else {
        this.onLowScore();
      }
    }
  }

  onStateChange(state: State[]) {
    this.consoleLogMsg('level-one.component', 'onStateChange');
    if (state && state.length) {
      let levelValue: any = this._stateService.getKeyValue('level'),
        stateLevel: number = levelValue && levelValue !== undefined ? Number(levelValue) : 1,
        boardLevel: number = this.board && this.board.level ? this.board.level : 1;
      if (stateLevel > boardLevel) {
        this._router.navigate([this.board.nextScreen], Config.transitionWithoutHistory);
      }
    }
  }

  onResetTap(): void {
    this.onInit();
  }

  onSquareTap(square: Square): void {
    let squareB: Square = this._boardService.emptySquare;

    if (!this._boardService.isEmpty(square) && this._boardService.isValidMove(square, squareB)) {
      this._boardService.moveSquare(square, squareB);
    }

  }

  onLowScore(): void {
    Dialogs.confirm({
      title: 'W i n n e r',
      message: 'You solved the puzzle in ' + this.board.moves + ' moves!',
      okButtonText: 'Ok'
    }).then(() => {
      this._stateService.updateLevel(2);
    });
  }

  onHighScore(): void {
    Dialogs.confirm({
      title: 'W i n n e r',
      message: 'You solved the puzzle in ' + this.board.moves + ' moves!',
      okButtonText: 'Ok'
    }).then(() => {
      this._stateService.updateLevel(2);
      this._router.navigate([
        'add-high-score/:level:moves:caller', {
          moves: this.board.moves,
          level: this.board.level,
          caller: this.board.nextScreen
        }
      ], Config.transitionWithoutHistory);
    });
  }

  onSkipLevelTap(): void {
    this.consoleLogMsg('level-one.component', 'onSkipLevelTap');
    this.onHighScore();
  }


}
