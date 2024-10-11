import React, { useState, useReducer, useRef, useEffect } from 'react';
import { css } from '@emotion/react';
import { Storage } from '../common';
import { getScanUrl } from '../prefix';
import Modal from "react-modal";
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { getNonce, getTransactions, invokeMethod, startAudit, stopAudit } from '../api';
import moonJson from '../moons'
import PatternComponent from './PatternComponent';
import Chart from 'chart.js/auto';
import { parse } from 'postcss';

Modal.setAppElement("#root");
const HomePageStyle = css`
  input: {
    height: 30px
  }
`;


let initialized = false;
let socket = null;

let currentCount = 200;
let currentStartPoint = 200;
let currentPercentCount = 200;

let mainBranchPercentCount = -100;
let engineGraphCount = 60;
const sma2Data = [];
const ratesData = [];
const totalRatesDataArray = [];
const totalRatesData = [];
let totalPRatesData = {};


let isBettingEnable = false;
let isAutoUp = false;
let isAutoReset = false;
let isTrenball1X = false;
let isTrenball2X = false;

let percentCountGlobal = 10;


let predictRatesCanvas = [];
let predictRatesCanvasObjs = [];
let predictRatesCanvasObjs10 = [];


let predictRatesData = null;
let predictRatesDataMap = null;
let predictRatesCount = 10;
let predictRatesShowCount = 30;


let currentBranchIndex = 0;


let activatedCharts = [];

for (let i = 0; i < 30; i++) {
  predictRatesCanvas.push(i);
}

const HomePage = () => {

  const [moonData, setMoonData] = useState([])
  const [chartType, setChartType] = useState()
  const [killData, setKillData] = useState([])
  const [moonDataFilter, setMoonDataFilter] = useState([])
  const [killDataFilter, setKillDataFilter] = useState([])
  const [filterTypeOfMoon, setFilterTypeOfMoon] = useState()
  const [filterTypeOfKill, setFilterTypeOfKill] = useState()
  const [updated, setUpdated] = useState(false)
  const logElRef = useRef(null);
  const filterElMoonPatternRef = useRef(null)
  const filterElMoonScoreRef = useRef(null)
  const filterElMoonMinRef3 = useRef(null)
  const filterElMoonMaxRef = useRef(null)
  const filterElMoonMinRef2 = useRef(null)
  const filterElMoonMaxRef2 = useRef(null)

  const filterElMoonMinRef4 = useRef(null)
  const filterElMoonMaxRef4 = useRef(null)

  const filterElKillPatternRef = useRef(null)
  const filterElKillScoreRef = useRef(null)
  const filterElKillProfitRef = useRef(null)
  const [currentColor, setCurrentColor] = useState(-1)

  const [totalBet, setTotalBet] = useState(0)
  const [totalWin, setTotalWin] = useState(0)
  const [totalLose, setTotalLose] = useState(0)
  const [total2XWin, setTotal2XWin] = useState(0)
  const [currentBetting, setCurrentBetting] = useState()
  const [patternCount, setPatternCount] = useState()
  const [percentCount, setPercentCount] = useState()

  const [startPoint, setStartPoint] = useState()
  const [currentTrends, setCurrentTrends] = useState(undefined)
  const [directions, setDirections] = useState([0, 0, 0])
  const [moonCheckResult, setMoonCheckResult] = useState()
  const [currentScoreData, setCurrentScoreData] = useState();
  const [predict, setPredict] = useState();
  const [predictRates, setPredictRates] = useState();
  const [sma2, setSma2] = useState();
  const [rates, setRates] = useState();
  const [status, setStatus] = useState();
  const [percent, setPercent] = useState({})
  const [initialBet, setInitialBet] = useState();
  const [initialPayout, setInitialPayout] = useState();
  const [martingaleCount, setMartingaleCount] = useState();
  const [deposit, setDeposit] = useState(0);
  const [currentBet2X, setCurrentBet2X] = useState();


  const [maxAmount, setMaxAmount] = useState();
  const [mainBranch, setMainBranch] = useState();
  const [currentBranch, setCurrentBranch] = useState(0);

  const [engineDataP, setEngineDataP] = useState(0);
  const [engineData1P, setEngineData1P] = useState(0);
  const [engineData2P, setEngineData2P] = useState(0);
  const [engineData3P, setEngineData3P] = useState(0);

  const [bettingTypeWith3, setBettingTypeWith3] = useState({x1Count: 0, x2Count: 0, bettingType: 0});
  const [bettingTypeWith2, setBettingTypeWith2] = useState({x1Count: 0, x2Count: 0, bettingType: 0});



  let scoreChartObj = null;
  let score3xChartObj = null;
  let payoutChartObj = null;
  let scoreData = null;
  let payoutData = null;

  let engineData = null;
  let engineData1 = null;
  let engineData2 = null;
  let engineData3 = null;
  let engineData4 = null;
  let engineData3X = null;
  let engineData2X = null;

  let engineData1Min = null;
  let engineData2Min = null;
  let engineData3Min = null;
  let engineDataBCMin = null;

  let branchChartData = null;
  // let engineData2P = 0;
  // let engineDataP = 0;


  let engineChartObj1 = null;
  let engineChartObj3 = null;
  let engineChartObj2 = null;
  let branchChart = null;
  let engineChartBCObj = null;
  let engineChartObj3X = null;
  let engineChartObj2X = null;

  let engineChartFinalObj = null;


  let engineChartObj1Min = null;
  let engineChartObj2Min = null;
  let engineChartObj3Min = null;
  let engineChartBCObjMin = null;
  let engineChartBranchMinObj = null;



  let engineChartGoodObj = null;
  let engineChartBadObj = null;
  let engineChartMidObj = null;


  let clickedPoint = false;






  const initializeSocket = () => {
    socket = new WebSocket('ws://localhost:3000');


    socket.onopen = function (e) {
      console.log('CONNECTED');
      socket.send(JSON.stringify({
        command: 'logclient'
      }))

      socket.send(JSON.stringify({
        command: 'moondata'
      }))
      socket.send(JSON.stringify({
        command: 'killdata'
      }))

      socket.send(JSON.stringify({
        command: 'getoptions'
      }))

      setInterval(() => {
        socket.send(JSON.stringify({
          command: 'getoptions',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 5000)
      // socket.send(JSON.stringify({
      //   command: 'simulationhistory'
      // }))
      // setInterval(() => {
      //   socket.send(JSON.stringify({
      //     command: 'simulationhistory',
      //     count: currentCount || 200,
      //     start: currentStartPoint || 200,

      //   }))
      // }, 800)


      socket.send(JSON.stringify({
        command: 'bettinghistory'
      }))
      setInterval(() => {
        socket.send(JSON.stringify({
          command: 'bettinghistory',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 5000)

      socket.send(JSON.stringify({
        command: 'bettinghistorytest'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)

      socket.send(JSON.stringify({
        command: 'bettinghistorytest1'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest1',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)


      socket.send(JSON.stringify({
        command: 'predictrates'
      }))
      setInterval(() => {
        socket.send(JSON.stringify({
          command: 'predictrates',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)
      socket.send(JSON.stringify({
        command: 'bettinghistorytest3'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest3',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)

      socket.send(JSON.stringify({
        command: 'bettinghistorytest4'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest4',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)

      socket.send(JSON.stringify({
        command: 'bettinghistorytest2x'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest2x',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)



      socket.send(JSON.stringify({
        command: 'bettinghistorytest2'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest2',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)

      socket.send(JSON.stringify({
        command: 'bettinghistorytest3x'
      }))
      setInterval(() => {


        socket.send(JSON.stringify({
          command: 'bettinghistorytest3x',
          count: currentCount || 200,
          start: currentStartPoint || 200,

        }))
      }, 800)




      socket.send(JSON.stringify({
        command: 'currentmoonpayouts'
      }))
      setInterval(() => {
        socket.send(JSON.stringify({
          command: 'currentmoonpayouts'
        }))
      }, 5000)


    };

    socket.onmessage = async function (event) {
      try {
        const json = JSON.parse(event.data);
        // console.log('JSON', json);

        if (json.command == 'logFinal') {
          const {
            classic, trenball, betScore, totalLose, sumLoses, betScore1
          } = json;

          let logTxt = `totalBet: ${Math.round(classic.totalBet)} Bet: ${Math.round(classic.betAmount + trenball.betAmount)} Lose: ${Math.round(classic.totalBet - classic.loseAmount - trenball.loseAmount)} Trenball: ${Math.round(trenball.lowBetAmount)} / ${Math.round(trenball.betAmount - trenball.moonBetAmount - trenball.lowBetAmount)} / ${Math.round(trenball.moonBetAmount)} Score: ${classic.score}`

          logTxt += `\nBetScore: ` + JSON.stringify(betScore);
          logTxt += `\nLoses: ${JSON.stringify(sumLoses)} TotalLose: ${totalLose}`;
          for (let i = betScore1.values.length - 1; i >= 0; i--) {
            for (let j = betScore1.values[i].length - 1; j >= 0; j--) {
              if (betScore1.values[i][j] <= 0) {
                logTxt += `\n-----------${betScore1.values[i][j]}`
              } else {
                logTxt += `\n${betScore1.values[i][j]}`
              }
            }
          }

          // logElRef.current.value = logElRef.current.value + `\n-------------------------------------------------------------------------------------`;
          // logElRef.current.value = logElRef.current.value + `\n` + logTxt;
          // logElRef.current.scrollTop = logElRef.current.scrollHeight;



          // logElRef.current.value = logElRef.current.value + `\n-------------------------------------------------------------------------------------`;
        }

        if (json.command == 'logCurrent') {
          return;
          const {
            classic, trenball, lowBetPro1, lowBetPro2, midBetPro, status
          } = json;


          const logTxt = `totalBet: ${Math.round(classic.totalBet)} Bet: ${Math.round(classic.betAmount + trenball.betAmount)} Lose: ${Math.round(classic.totalBet - classic.loseAmount - trenball.loseAmount)} Trenball: (${lowBetPro1}% | ${lowBetPro2}% | ${midBetPro}%) / (${midBetPro}%) / (${Math.round((classic.totalBet - trenball.moonBetAmount * 10) * 100 / classic.totalBet)}%) / ${status}`

          logElRef.current.value = logElRef.current.value + `\n` + logTxt;
          logElRef.current.scrollTop = logElRef.current.scrollHeight;

        }


        if (json.command == 'getoptions') {
          const { result } = json;



          try {
            isAutoReset = result.isAutoReset;
            isAutoUp = result.isAutoUp;
            isBettingEnable = result.isBettingEnable;
            isTrenball1X = result.isTrenball1X;
            isTrenball2X = result.isTrenball2X;
            let branches = result.branches;
            activatedCharts = branches;
            setInitialBet(result.initialBet);
            setInitialPayout(result.initialPayout);
            setMaxAmount(result.maxAmount);
            setMainBranch(result.mainBranch);
            setMartingaleCount(result.martingaleCount);
            setCurrentBet2X(result.currentBet2X);
            setDeposit(result.deposit);
          } catch (err) {
            console.log("GET OPTIONS ERROR", err)
          }


        }

        if (json.command == 'moondata') {
          const {
            result
          } = json;

          // console.log(result);
          setMoonData(result);
        }

        if (json.command == 'killdata') {
          const {
            result
          } = json;
          setKillData(result);
        }

        if (json.command == 'predict') {
          const { result, status } = json;


          setPredict(result);
          setStatus(status);

        }

        if (json.command == 'predictrates') {
          const { result } = json;
          // console.log('PREDICTS', result);
          setPredictRates(result);

          

          sma2Data.splice(0, 100);
          ratesData.splice(0, 100);
          totalRatesData.splice(0, 100);
          totalPRatesData = {};

          let winCount = 0;
          const loseCounts = [];
          const winCounts = [];
          let loseCount = 0;
          let maxWinCount = 0;

          let b = -1;

          predictRatesDataMap = [];


          // const bcAndAll = result.filter(p => p.type == 'all' || p.type == 'bc' );

          // result.sort((a, b) => {
          //   return a.branchIndex - b.branchIndex
          // })

          // result.unshift(bcAndAll[0])
          // result.unshift(bcAndAll[1])


          result.map(p => {
            p.index = p.branchIndex,
            p.count = p.branchIndex + 5,
            p.data = p.payouts100.slice(predictRatesShowCount * -1);
            p.data10 = p.payouts10;

            const win3 = p.data10.slice(p.data10.length - 4, p.data10.length - 1).filter(p => p.isRight == 1).length == 3;
            const win2 = p.data10.slice(p.data10.length - 3, p.data10.length - 1).filter(p => p.isRight == 1).length == 2

            // const win3 = p.data10.slice(-3).filter(p => p.isRight == 1).length == 3;
            // const win2 = p.data10.slice(-2).filter(p => p.isRight == 1).length == 2;


            // const payoutResult = sortValues(p.map(a => a.isRight).slice(-20), (v) => {
            //   return v == 1 ? 1 : 0 // 1 is green, 0 is red
            // }, 1);
          
            // const checkLength = 5
            // const pLength = payoutResult.values.map(p => p.length).slice(0, checkLength);

            // console.log(payoutResult);
            

            p.win3 = win3
            p.win2 = win2
            predictRatesDataMap.push(p);
            if (p.branchIndex == currentBranchIndex) {
              branchChartData = p.data
            }
          });

          let x2Count = 0, x1Count = 0;
          result.filter(p => p.win3).map(p => {
            if (p.data10[p.data10.length - 1].bettingType == 2) {
              x2Count++;
            } else {
              x1Count++;
            }
          });

          if (x2Count == x1Count) {
            if (x2Count == 0) {
              
            }

            setBettingTypeWith3({
              x2Count,
              x1Count,
              bettingType: 0,

            });
          } else if (x2Count > x1Count) {
            setBettingTypeWith3({x2Count,
              x1Count,
              bettingType: 2
            });
          } else {
            setBettingTypeWith3({
              x2Count,
              x1Count,
              bettingType: 1,
            });
          }


          x2Count = 0; x1Count = 0;
          result.filter(p => p.win2).map(p => {
            if (p.data10[p.data10.length - 1].bettingType == 2) {
              x2Count++;
            } else {
              x1Count++;
            }
          });

          if (x2Count == x1Count) {
            if (x2Count == 0) {
              
            }

            setBettingTypeWith2({
              x2Count,
              x1Count,
              bettingType: 0,

            });
          } else if (x2Count > x1Count) {
            setBettingTypeWith2({x2Count,
              x1Count,
              bettingType: 2
            });
          } else {
            setBettingTypeWith2({
              x2Count,
              x1Count,
              bettingType: 1,
            });
          }



          predictRatesDataMap.map((p, pIndex) => {
            let sum = 0;
            let labels10 = [];
            let labels = [];

            let datasets = [];
            let datasets10 = [];

            p.data.slice(-100).map((p, index) => {
              if (p.isRight == 1) {
                winCount++;
                maxWinCount++;
                loseCount = 0;
                winCounts.push(maxWinCount);
              }

              if (p.isRight == 0) {
                loseCount++;
                maxWinCount = 0;
                loseCounts.push(loseCount);
              }
            })
            
            // let's find second lose point
            sum = 0;
            let yData = p.data.map((row, index) => {
              labels.push(index);
              if (index == 0) {
                sum = 0;
              } else {
                if (row.isRight == 1) {
                  sum += 1;
                } else {
                  sum -= 1;
                }
              }

              return sum;
            });

            let yDataSMA = [];
            for (let i = 0; i < yData.length; i++) {
              [2, 3, 4].map((count, index) => {
                if (yDataSMA.length < (index + 1)) {
                  yDataSMA.push([]);
                }
                if (i < count - 1) {
                  yDataSMA[index].push(0);
                } else {
                  const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                  yDataSMA[index].push(v);
                }
              })
            }
            
            let yData10 = p.data10.map((row, index) => {
              labels10.push(index);
              if (index == 0) {
                sum = 0;
              } else {
                if (row.isRight == 1) {
                  sum += 1;
                } else {
                  sum -= 1;
                }
              }

              return sum;
            });

            let yDataSMA10 = [];
            for (let i = 0; i < yData10.length; i++) {
              [2, 3, 4].map((count, index) => {
                if (yDataSMA10.length < (index + 1)) {
                  yDataSMA10.push([]);
                }
                if (i < count - 1) {
                  yDataSMA10[index].push(0);
                } else {
                  const v = yData10.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                  yDataSMA10[index].push(v);
                }
              })
            }
            
            sma2Data.push(yDataSMA[0][yDataSMA[0].length - 1]);
            const winCount5 = p.data.slice(-5).filter(p => p.isRight == 1).length;
            const winCountAll = p.data.slice(percentCountGlobal * -1).filter(p => p.isRight == 1).length;
            ratesData.push(winCount5);

            totalRatesData.push({
              index: pIndex,
              sma2: yDataSMA[0][yDataSMA[0].length - 1],
              rate: winCount5 * 100 / 5,
              trate: winCountAll * 100 / p.data.slice(percentCountGlobal * -1).length,
              maxLose: Math.max(...loseCounts),
              maxWin: Math.max(...winCounts),
            });

            

            p.sma2 = yDataSMA10[0][yDataSMA10[0].length - 1];
            p.datasets = datasets;
            p.datasets10 = datasets10;
            p.yDataSMA = yDataSMA;
            p.yDataSMA10 = yDataSMA10;
            p.labels = labels;
            p.labels10 = labels10;
            p.yData = yData;
            p.yData10 = yData10;
            datasets.push(yDataSMA);
            datasets10.push(yDataSMA10);
          })

          // for (let i = 0; i < predictRatesDataMap.length; i++) {
          //   let sum = 0;
          //   let labels10 = [];
          //   let labels = [];

          //   let datasets = [];
          //   let datasets10 = [];

          //   predictRatesDataMap[i].data.slice(-100).map((p, index) => {
          //     if (p.isRight == 1) {
          //       winCount++;
          //       maxWinCount++;
          //       loseCount = 0;
          //       winCounts.push(maxWinCount);
          //     }

          //     if (p.isRight == 0) {
          //       loseCount++;
          //       maxWinCount = 0;
          //       loseCounts.push(loseCount);
          //     }
          //   })

          //   // let's find second lose point
          //   sum = 0;
          //   let prevBust = -1;
          //   let plusArray = [];
          //   let minusArray = [];


          //   // predictRatesDataMap[i].data.slice(predictRatesCount * -1).map((row, index) => {
          //   //   if (row.isRight == 1) {
          //   //     sum += 1;
          //   //     if (prevBust == -1) {
          //   //       plusArray.push({
          //   //         index: index
          //   //         , sum
          //   //       });
          //   //     } else if (prevBust == 1) {
          //   //       if (plusArray.length > 0) {
          //   //         plusArray[plusArray.length - 1] = {
          //   //           index: index
          //   //           , sum
          //   //         };
          //   //       }
          //   //     } else {
          //   //       plusArray.push({
          //   //         index: index
          //   //         , sum
          //   //       });
          //   //     }

          //   //   } else {
          //   //     sum -= 1;
          //   //     if (prevBust == -1) {
          //   //       minusArray.push({
          //   //         index: index
          //   //         , sum
          //   //       });
          //   //     } else if (prevBust == 0) {
          //   //       if (minusArray.length > 0) {
          //   //         minusArray[minusArray.length - 1] = {
          //   //           index: index
          //   //           , sum
          //   //         };
          //   //       }
          //   //     } else {
          //   //       minusArray.push({
          //   //         index: index
          //   //         , sum
          //   //       });
          //   //     }

          //   //   }
          //   //   prevBust = row.isRight;
          //   //   return sum;
          //   // });

          //   // let currentLosePoint = 1;
          //   // let currentLoseSum = 100000;
          //   // let foundSecondPoint = false;

          //   // let foundMinuses = [];


          //   // let currentLosePointIndex = 1;


            
          //   // try {
          //   //   while (currentLosePointIndex <= minusArray.length) {
          //   //     if (minusArray[minusArray.length - currentLosePointIndex].sum < currentLoseSum) {
          //   //       // console.log("CURRENT LOSE POINT", currentLosePointIndex, currentLosePoint, minusArray.length);
          //   //       foundMinuses.push(minusArray[minusArray.length - currentLosePointIndex]);
          //   //       currentLoseSum = minusArray[minusArray.length - currentLosePointIndex].sum;
          //   //       currentLosePoint = minusArray[minusArray.length - currentLosePointIndex].index;

          //   //       if (foundMinuses.length >= 2) {
          //   //         break;
          //   //       }
          //   //     }
          //   //     currentLosePointIndex++;
          //   //   }
          //   // } catch (err) {
          //   //   console.log('ERRRRRRRR', err, i, minusArray)
          //   // }

          //   // if (foundMinuses.length < 2) {
          //   //   currentLosePoint = 0; //predictRatesDataMap[i].data.length - 10;
          //   //   //currentLosePoint = 1;
          //   // }
          //   // predictRatesDataMap[i].data10 = predictRatesDataMap[i].data.slice(predictRatesCount * -1).slice(currentLosePoint - 0, predictRatesDataMap[i].data.length);

          //   // if (predictRatesDataMap[i].index == 0) {
          //   //   // console.log('MINUS ARRAY', minusArray)
          //   //   // console.log('foundMinuses Index:', i, currentLosePoint, minusArray.length, predictRatesDataMap[i].data10.length);
          //   // }


          //   let yData = predictRatesDataMap[i].data.map((row, index) => {
          //     labels.push(index);
          //     if (index == 0) {
          //       sum = 0;
          //     } else {
          //       if (row.isRight == 1) {
          //         sum += 1;
          //       } else {
          //         sum -= 1;
          //       }
          //     }

          //     return sum;
          //   });

          //   let yDataSMA = [];
          //   for (let i = 0; i < yData.length; i++) {
          //     [2, 3, 4].map((count, index) => {
          //       if (yDataSMA.length < (index + 1)) {
          //         yDataSMA.push([]);
          //       }
          //       if (i < count - 1) {
          //         yDataSMA[index].push(0);
          //       } else {
          //         const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
          //         yDataSMA[index].push(v);
          //       }
          //     })
          //   }

          //   let yData10 = predictRatesDataMap[i].data10.map((row, index) => {
          //     labels10.push(index);
          //     if (index == 0) {
          //       sum = 0;
          //     } else {
          //       if (row.isRight == 1) {
          //         sum += 1;
          //       } else {
          //         sum -= 1;
          //       }
          //     }

          //     return sum;
          //   });

          //   let yDataSMA10 = [];
          //   for (let i = 0; i < yData10.length; i++) {
          //     [2, 3, 4].map((count, index) => {
          //       if (yDataSMA10.length < (index + 1)) {
          //         yDataSMA10.push([]);
          //       }
          //       if (i < count - 1) {
          //         yDataSMA10[index].push(0);
          //       } else {
          //         const v = yData10.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
          //         yDataSMA10[index].push(v);
          //       }
          //     })
          //   }

          //   sma2Data.push(yDataSMA[0][yDataSMA[0].length - 1]);
          //   const winCount5 = predictRatesDataMap[i].data.slice(-5).filter(p => p.isRight == 1).length;
          //   const winCountAll = predictRatesDataMap[i].data.slice(percentCountGlobal * -1).filter(p => p.isRight == 1).length;
          //   ratesData.push(winCount5);



          //   totalRatesData.push({
          //     index: i,
          //     sma2: yDataSMA[0][yDataSMA[0].length - 1],
          //     rate: winCount5 * 100 / 5,
          //     trate: winCountAll * 100 / predictRatesData[i].slice(percentCountGlobal * -1).length,
          //     maxLose: Math.max(...loseCounts),
          //     maxWin: Math.max(...winCounts),

          //   });

          //   predictRatesDataMap[i].sma2 = yDataSMA10[0][yDataSMA10[0].length - 1];
          //   predictRatesDataMap[i].datasets = datasets;
          //   predictRatesDataMap[i].datasets10 = datasets10;
          //   predictRatesDataMap[i].yDataSMA = yDataSMA;
          //   predictRatesDataMap[i].yDataSMA10 = yDataSMA10;
          //   predictRatesDataMap[i].labels = labels;
          //   predictRatesDataMap[i].labels10 = labels10;
          //   predictRatesDataMap[i].yData = yData;
          //   predictRatesDataMap[i].yData10 = yData10;
          //   datasets.push(yDataSMA);
          //   datasets10.push(yDataSMA10);

          //   console.log(predictRatesDataMap[i]);
          //   // totalRatesDataArray.push(totalRatesData);
          //   // const chartObj = predictRatesCanvasObjs[i];
          //   // chartObj.data.labels = labels;
          //   // chartObj.data.datasets[0].data = yData;
          //   // datasets.map(yDataSMA => {
          //   //   yDataSMA.map((sma, index) => {
          //   //     chartObj.data.datasets[index + 1].data = sma;
          //   //   })
          //   // })
          //   // chartObj.update();
            
          // }

          // predictRatesDataMap.sort((a, b) => {
          //   return b.sma2 - a.sma2;
          // });

          // console.log(predictRatesDataMap);

          predictRatesDataMap.map((p, idx) => {

            
            const chartObj = predictRatesCanvasObjs[idx];
            chartObj.data.labels = p.labels;
            chartObj.data.datasets[0].data = p.yData;
            chartObj.data.datasets[0].label = `Line(${p.index})`;

            p.datasets.map(yDataSMA => {
              yDataSMA.map((sma, index) => {
                chartObj.data.datasets[index + 1].data = sma;
              })
            })
            chartObj.update();

            const chartObj10 = predictRatesCanvasObjs10[idx];
            chartObj10.data.labels = p.labels10;
            chartObj10.data.datasets[0].data = p.yData10;
            chartObj10.data.datasets[0].label = `Line(${p.index})`;

            p.datasets10.map(yDataSMA => {
              yDataSMA.map((sma, index) => {
                chartObj10.data.datasets[index + 1].data = sma;
              })
            })
            chartObj10.update();


            if (currentBranchIndex == p.index) {
              branchChart.data.labels = p.labels;
              branchChart.data.datasets[0].data = p.yData;
              branchChart.data.datasets[0].label = `Line(${p.index})`;

              p.datasets.map(yDataSMA => {
                yDataSMA.map((sma, index) => {
                  branchChart.data.datasets[index + 1].data = sma;
                })
              })
              branchChart.update();
            }
          })


          // for (let k = 0; k < 3; k++) {

          //   let chartObj = engineChartMidObj;



          //   if (k == 0) {
          //     chartObj = engineChartGoodObj;

          //   } else if (k == 1) {
          //     chartObj = engineChartBadObj;

          //   }

          //   for (let j = 0; j < 1; j++) {
          //     b++;

          //   }
          // }
          setSma2(sma2Data);
          setRates(ratesData);



          totalRatesData.sort((a, b) => {
            return b.trate - a.trate;
          });
          totalRatesData.map(p => {
            if (totalPRatesData[p.rate] == undefined) {
              totalPRatesData[p.rate] = 1;
            } else {
              totalPRatesData[p.rate] = totalPRatesData[p.rate] + 1;
            }
          })
          // console.log('totalRatesData', totalRatesData);
        }


        if (json.command == 'bettinghistorytest') {
          const {
            result
          } = json;


          if (result.length == 0) {
            return;
          }

          engineData = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData.filter(p => (p.betOrNot == true || p.betOrNot == 1)).slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineDataP(rightCount * 100 / engineData.slice(mainBranchPercentCount).length);
          }

          let sum = 0;
          let labels = [];
          let yData = engineData.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });

          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartFinalObj.data.labels = labels;
          engineChartFinalObj.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartFinalObj.data.datasets[index + 1].data = sma;
          })
          engineChartFinalObj.update();

        }


        if (json.command == 'bettinghistorytest1' || json.command == 'bettingscore') {
          const {
            result
          } = json;


          if (result.length == 0) {
            return;
          }

          engineData1 = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData1.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineData1P(rightCount * 100 / engineData1.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 1", rightCount, engineData1.slice(mainBranchPercentCount).length);

          let sum = 0;
          let prevBust = -1;
          let plusArray = [];
          let minusArray = [];

          let labels = [];
          let yData = engineData1.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;

              if (prevBust == -1) {
                plusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 1) {
                if (plusArray.length > 0) {
                  plusArray[plusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                plusArray.push({
                  index: index
                  , sum
                });
              }

            } else {
              sum -= 1;
              if (prevBust == -1) {
                minusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 0) {
                if (minusArray.length > 0) {
                  minusArray[minusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                minusArray.push({
                  index: index
                  , sum
                });
              }
            }
            prevBust = row.isRight;
            return sum;
          });

          let currentLosePoint = 1;
          let currentLoseSum = 100000;
          let foundMinuses = [];

          let currentLosePointIndex = 1;

          try {
            while (currentLosePointIndex <= minusArray.length) {
              if (minusArray[minusArray.length - currentLosePointIndex].sum < currentLoseSum) {
                // console.log("CURRENT LOSE POINT", currentLosePointIndex, currentLosePoint, minusArray.length);
                foundMinuses.push(minusArray[minusArray.length - currentLosePointIndex]);
                currentLoseSum = minusArray[minusArray.length - currentLosePointIndex].sum;
                currentLosePoint = minusArray[minusArray.length - currentLosePointIndex].index;

                if (foundMinuses.length >= 2) {
                  break;
                }
              }
              currentLosePointIndex++;
            }
          } catch (err) {
            console.log('ERRRRRRRR', err, i, minusArray)
          }

          if (foundMinuses.length < 2) {
            currentLosePoint = engineData1.length - 10;
          } else if (currentLosePoint < engineData1.length - 10) {
            // currentLosePoint = engineData1.length - 10;
            // currentLosePoint = engineData1.length - 1; //engineData1.length - 10;
            currentLosePoint = foundMinuses[0].index
          }

          engineData1Min = engineData1.slice(currentLosePoint - 0, engineData1.length);
          // console.log("GRAPH1", foundMinuses, currentLosePoint, engineData1.length, engineData1Min.length);
          sum = 0;
          let labelsMin = [];
          let yDataMin = engineData1Min.map((row, index) => {
            labelsMin.push(index);
            if (index == 0) {
              sum = 0;
              return sum;
            }
            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });

          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }



          if (json.command == 'bettinghistorytest1') {
            engineChartObj1.data.labels = labels;
            engineChartObj1.data.datasets[0].data = yData;

            yDataSMA.map((sma, index) => {
              engineChartObj1.data.datasets[index + 1].data = sma;
            })
            engineChartObj1.update();

            engineChartObj1Min.data.labels = labelsMin;
            engineChartObj1Min.data.datasets[0].data = yDataMin;
            engineChartObj1Min.update();
          }
        }


        if (json.command == 'bettinghistorytest3') {
          const {
            result
          } = json;

          // engineData3 = result.slice(-527).filter(p => p.betOrNot).slice(-400);
          engineData3 = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData3.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineData3P(rightCount * 100 / engineData3.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 3", rightCount, engineData3.slice(mainBranchPercentCount).length);
          let sum = 0;
          let prevBust = -1;
          let plusArray = [];
          let minusArray = [];

          let labels = [];
          let yData = engineData3.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;

              if (prevBust == -1) {
                plusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 1) {
                if (plusArray.length > 0) {
                  plusArray[plusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                plusArray.push({
                  index: index
                  , sum
                });
              }

            } else {
              sum -= 1;
              if (prevBust == -1) {
                minusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 0) {
                if (minusArray.length > 0) {
                  minusArray[minusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                minusArray.push({
                  index: index
                  , sum
                });
              }
            }
            prevBust = row.isRight;
            return sum;
          });

          let currentLosePoint = 1;
          let currentLoseSum = 100000;
          let foundMinuses = [];
          let currentLosePointIndex = 1;
          try {
            while (currentLosePointIndex <= minusArray.length) {
              if (minusArray[minusArray.length - currentLosePointIndex].sum < currentLoseSum) {
                // console.log("CURRENT LOSE POINT", currentLosePointIndex, currentLosePoint, minusArray.length);
                foundMinuses.push(minusArray[minusArray.length - currentLosePointIndex]);
                currentLoseSum = minusArray[minusArray.length - currentLosePointIndex].sum;
                currentLosePoint = minusArray[minusArray.length - currentLosePointIndex].index;

                if (foundMinuses.length >= 2) {
                  break;
                }
              }
              currentLosePointIndex++;
            }
          } catch (err) {
            console.log('ERRRRRRRR', err, i, minusArray)
          }

          if (foundMinuses.length < 2) {
            currentLosePoint = engineData3.length - 10;
          } else if (currentLosePoint < engineData3.length - 10) {
            // currentLosePoint = engineData3.length - 10;
            // currentLosePoint = engineData3.length - 1; //engineData3.length - 10;
            currentLosePoint = foundMinuses[0].index
          }

          engineData3Min = engineData3.slice(currentLosePoint - 0, engineData3.length);
          // console.log("GRAPH3", foundMinuses, currentLosePoint, engineData3.length, engineData3Min.length);
          sum = 0;
          let labelsMin = [];
          let yDataMin = engineData3Min.map((row, index) => {
            labelsMin.push(index);
            if (index == 0) {
              sum = 0;
              return sum;
            }
            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });

          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartObj3.data.labels = labels;
          engineChartObj3.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartObj3.data.datasets[index + 1].data = sma;
          })
          engineChartObj3.update();

          engineChartObj3Min.data.labels = labelsMin;
          engineChartObj3Min.data.datasets[0].data = yDataMin;
          engineChartObj3Min.update();
        }

        if (json.command == 'bettinghistorytest4') {
          const {
            result
          } = json;

          // engineData3 = result.slice(-527).filter(p => p.betOrNot).slice(-400);
          engineData4 = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData4.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineData3P(rightCount * 100 / engineData4.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 3", rightCount, engineData4.slice(mainBranchPercentCount).length);
          let sum = 0;
          let prevBust = -1;
          let plusArray = [];
          let minusArray = [];

          let labels = [];
          let yData = engineData4.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;

              if (prevBust == -1) {
                plusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 1) {
                if (plusArray.length > 0) {
                  plusArray[plusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                plusArray.push({
                  index: index
                  , sum
                });
              }

            } else {
              sum -= 1;
              if (prevBust == -1) {
                minusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 0) {
                if (minusArray.length > 0) {
                  minusArray[minusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                minusArray.push({
                  index: index
                  , sum
                });
              }
            }
            prevBust = row.isRight;
            return sum;
          });

          let currentLosePoint = 1;
          let currentLoseSum = 100000;
          let foundMinuses = [];

          let currentLosePointIndex = 1;

          try {
            while (currentLosePointIndex <= minusArray.length) {
              if (minusArray[minusArray.length - currentLosePointIndex].sum < currentLoseSum) {
                // console.log("CURRENT LOSE POINT", currentLosePointIndex, currentLosePoint, minusArray.length);
                foundMinuses.push(minusArray[minusArray.length - currentLosePointIndex]);
                currentLoseSum = minusArray[minusArray.length - currentLosePointIndex].sum;
                currentLosePoint = minusArray[minusArray.length - currentLosePointIndex].index;

                if (foundMinuses.length >= 2) {
                  break;
                }
              }
              currentLosePointIndex++;
            }
          } catch (err) {
            console.log('ERRRRRRRR', err, i, minusArray)
          }

          if (foundMinuses.length < 2) {
            currentLosePoint = engineData4.length - 10;
          } else if (currentLosePoint < engineData4.length - 10) {
            // currentLosePoint = engineData4.length - 10;
            // currentLosePoint = engineData4.length - 1; //engineData4.length - 10;
            currentLosePoint = foundMinuses[0].index
          }
          // console.log("GRAPH4", foundMinuses, currentLosePoint);
          engineDataBCMin = engineData4.slice(currentLosePoint - 0, engineData4.length);
          // console.log("GRAPH4", foundMinuses, currentLosePoint, engineData4.length, engineDataBCMin.length);
          sum = 0;
          let labelsMin = [];
          let yDataMin = engineDataBCMin.map((row, index) => {
            labelsMin.push(index);
            if (index == 0) {
              sum = 0;
              return sum;
            }
            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });


          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartBCObj.data.labels = labels;
          engineChartBCObj.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartBCObj.data.datasets[index + 1].data = sma;
          })
          engineChartBCObj.update();

          engineChartBCObjMin.data.labels = labelsMin;
          engineChartBCObjMin.data.datasets[0].data = yDataMin;
          engineChartBCObjMin.update();
        }


        if (json.command == 'bettinghistorytest2') {
          const {
            result
          } = json;

          engineData2 = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData2.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });

          if (!clickedPoint) {
            setEngineData2P(rightCount * 100 / engineData2.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 2", rightCount, engineData2.slice(mainBranchPercentCount).length);


          let sum = 0;
          let prevBust = -1;
          let plusArray = [];
          let minusArray = [];

          let labels = [];
          let yData = engineData2.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;

              if (prevBust == -1) {
                plusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 1) {
                if (plusArray.length > 0) {
                  plusArray[plusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                plusArray.push({
                  index: index
                  , sum
                });
              }

            } else {
              sum -= 1;
              if (prevBust == -1) {
                minusArray.push({
                  index: index
                  , sum
                });
              } else if (prevBust == 0) {
                if (minusArray.length > 0) {
                  minusArray[minusArray.length - 1] = {
                    index: index
                    , sum
                  };
                }
              } else {
                minusArray.push({
                  index: index
                  , sum
                });
              }
            }
            prevBust = row.isRight;
            return sum;
          });

          let currentLosePoint = 1;
          let currentLoseSum = 100000;
          let foundMinuses = [];
          let currentLosePointIndex = 1;
          try {
            while (currentLosePointIndex <= minusArray.length) {
              if (minusArray[minusArray.length - currentLosePointIndex].sum < currentLoseSum) {
                // console.log("CURRENT LOSE POINT", currentLosePointIndex, currentLosePoint, minusArray.length);
                foundMinuses.push(minusArray[minusArray.length - currentLosePointIndex]);
                currentLoseSum = minusArray[minusArray.length - currentLosePointIndex].sum;
                currentLosePoint = minusArray[minusArray.length - currentLosePointIndex].index;

                if (foundMinuses.length >= 2) {
                  break;
                }
              }
              currentLosePointIndex++;
            }
          } catch (err) {
            console.log('ERRRRRRRR', err, i, minusArray)
          }

          if (foundMinuses.length < 2) {
            currentLosePoint = engineData2.length - 10;
          } else if (currentLosePoint < engineData2.length - 10) {
            // currentLosePoint = engineData2.length - 10;
            // currentLosePoint = engineData2.length - 1; //engineData2.length - 10;
            currentLosePoint = foundMinuses[0].index
          }
          // console.log("GRAPH2", foundMinuses, currentLosePoint);
          engineData2Min = engineData2.slice(currentLosePoint - 0, engineData2.length);
          // console.log("GRAPH2", foundMinuses, currentLosePoint, engineData2.length, engineData2Min.length);
          sum = 0;
          let labelsMin = [];
          let yDataMin = engineData2Min.map((row, index) => {
            labelsMin.push(index);
            if (index == 0) {
              sum = 0;
              return sum;
            }
            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });


          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartObj2.data.labels = labels;
          engineChartObj2.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartObj2.data.datasets[index + 1].data = sma;
          })
          engineChartObj2.update();

          engineChartObj2Min.data.labels = labelsMin;
          engineChartObj2Min.data.datasets[0].data = yDataMin;
          engineChartObj2Min.update();
        }

        if (json.command == 'bettinghistorytest3x') {
          const {
            result
          } = json;

          // engineData3 = result.slice(-527).filter(p => p.betOrNot).slice(-400);
          engineData3X = result.slice(engineGraphCount * -1);

          let rightCount = 0;
          engineData3X.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineData3P(rightCount * 100 / engineData3X.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 3", rightCount, engineData3X.slice(mainBranchPercentCount).length);
          let sum = 0;
          let labels = [];
          let yData = engineData3X.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });

          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartObj3X.data.labels = labels;
          engineChartObj3X.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartObj3X.data.datasets[index + 1].data = sma;
          })
          engineChartObj3X.update();
        }

        if (json.command == 'bettinghistorytest2x') {
          const {
            result
          } = json;

          // engineData3 = result.slice(-527).filter(p => p.betOrNot).slice(-400);
          engineData2X = result.slice(engineGraphCount * -1);//.filter(p => p.betOrNot == 1);
          // engineData2X = result.slice(engineGraphCount * -1).filter(p => p.betOrNot == 1);

          let rightCount = 0;
          engineData2X.slice(mainBranchPercentCount).map(p => {
            if (p.isRight == 1) {
              rightCount++;
            }
          });
          if (!clickedPoint) {
            setEngineData3P(rightCount * 100 / engineData2X.slice(mainBranchPercentCount).length);
          }

          // console.log("GRAPH 3", rightCount, engineData2X.slice(mainBranchPercentCount).length);
          let sum = 0;
          let labels = [];
          let yData = engineData2X.map((row, index) => {

            labels.push(index);

            if (row.isRight == 1) {
              sum += 1;
            } else {
              sum -= 1;
            }
            return sum;
          });

          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          engineChartObj2X.data.labels = labels;
          engineChartObj2X.data.datasets[0].data = yData;

          yDataSMA.map((sma, index) => {
            engineChartObj2X.data.datasets[index + 1].data = sma;
          })
          engineChartObj2X.update();
        }

        const pointStyle = [];
        if (json.command == 'bettinghistory' || json.command == 'getpayouts') {
          const {
            result
          } = json;


          if (result.length == 0) {
            return;
          }
          scoreData = result;
          setCurrentScoreData(scoreData);

          let sum = 0;
          let sum3x = 0;
          let labels = [];


          let yData3X = [];

          let yData = result.map((row, index) => {

            labels.push(index);

            // if (row.nextScore < 3) {
            //   sum += -1;
            // } else {
            //   sum += 2;
            // }

            if (row.nextScore >= 3) {
              sum += 1;
              sum3x += 2;
            } else if (row.nextScore >= 2) {
              sum += 1;
              sum3x -= 1;
            } else {
              sum -= 1;
              sum3x -= 1;
            }

            yData3X.push(sum3x);
            return sum;
          });


          const payoutResult = sortValues(scoreData.slice(-100).map(p => p.nextScore), (v) => {
            return v >= 2 ? 1 : 0 // 1 is green, 0 is red
          });

          setCurrentTrends(payoutResult);
          

          let yData5SMA = [];
          let yData10SMA = [];
          let yData20SMA = [];


          for (let i = 0; i < yData.length; i++) {
            let count = 5;
            if (i < count - 1) {
              yData5SMA.push(0);
            } else {
              const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData5SMA.push(v);
            }

            count = 10;
            if (i < count - 1) {
              yData10SMA.push(0);
            } else {
              const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData10SMA.push(v);
            }

            count = 20;
            if (i < count - 1) {
              yData20SMA.push(0);
            } else {
              const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData20SMA.push(v);
            }

          }

          let yData5SMA3X = [];
          let yData10SMA3X = [];
          let yData20SMA3X = [];

          for (let i = 0; i < yData3X.length; i++) {
            let count = 5;
            if (i < count - 1) {
              yData5SMA3X.push(0);
            } else {
              const v = yData3X.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData5SMA3X.push(v);
            }

            count = 10;
            if (i < count - 1) {
              yData10SMA3X.push(0);
            } else {
              const v = yData3X.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData10SMA3X.push(v);
            }

            count = 20;
            if (i < count - 1) {
              yData20SMA3X.push(0);
            } else {
              const v = yData3X.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
              yData20SMA3X.push(v);
            }

          }

          scoreChartObj.data.labels = labels;
          scoreChartObj.data.datasets[0].data = yData;
          scoreChartObj.data.datasets[1].data = yData5SMA;
          scoreChartObj.data.datasets[2].data = yData10SMA;
          scoreChartObj.data.datasets[3].data = yData20SMA;
          // scoreChartObj.data.datasets[0].pointStyle = pointStyle;
          scoreChartObj.update();

          score3xChartObj.data.labels = labels;
          score3xChartObj.data.datasets[0].data = yData3X;
          score3xChartObj.data.datasets[1].data = yData5SMA3X;
          score3xChartObj.data.datasets[2].data = yData10SMA3X;
          score3xChartObj.data.datasets[3].data = yData20SMA3X;
          // scoreChartObj.data.datasets[0].pointStyle = pointStyle;
          score3xChartObj.update();


          const payouts = scoreData.slice(-100).map(p => p.nextScore);
          const shortDirection = checkTrendDirection(payouts, 10);
          const longDirection = checkTrendDirection(payouts, 25);
          const longDirection2 = checkTrendDirection(payouts, 40);

          setDirections([shortDirection, longDirection, longDirection2]);
        }

        if (json.command == 'simulationhistory') {
          const {
            result
          } = json;
          // console.log('simulationhistory', result);

          if (result.length == 0) {
            return;
          }
          scoreData = result.slice(engineGraphCount * -1);
          setCurrentScoreData(scoreData.map(p => p.nextScore));

          let sum = 0;
          let sum3x = 0;
          let labels = [];


          let yData3X = [];

          let yData = scoreData.map((row, index) => {

            labels.push(index);

            // if (row.nextScore < 3) {
            //   sum += -1;
            // } else {
            //   sum += 2;
            // }

            if (row.nextScore >= 3) {
              sum += 1;
              sum3x += 2;
            } else if (row.nextScore >= 2) {
              sum += 1;
              sum3x -= 1;
            } else {
              sum -= 1;
              sum3x -= 1;
            }

            yData3X.push(sum3x);
            return sum;
          });


          const payoutResult = sortValues(scoreData.slice(-100).map(p => p.nextScore), (v) => {
            return v >= 2 ? 1 : 0 // 1 is green, 0 is red
          });

          setCurrentTrends(payoutResult);




          let yDataSMA = [];
          for (let i = 0; i < yData.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA.length < (index + 1)) {
                yDataSMA.push([]);
              }
              if (i < count - 1) {
                yDataSMA[index].push(0);
              } else {
                const v = yData.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA[index].push(v);
              }
            })
          }


          let yDataSMA3X = [];
          for (let i = 0; i < yData3X.length; i++) {
            [2, 3, 4, 5].map((count, index) => {
              if (yDataSMA3X.length < (index + 1)) {
                yDataSMA3X.push([]);
              }
              if (i < count - 1) {
                yDataSMA3X[index].push(0);
              } else {
                const v = yData3X.slice(i - count + 1, i + 1).reduce((a, b) => a + b, 0) / count;
                yDataSMA3X[index].push(v);
              }
            })
          }




          scoreChartObj.data.labels = labels;
          scoreChartObj.data.datasets[0].data = yData;
          scoreChartObj.data.datasets[1].data = yDataSMA[0];
          scoreChartObj.data.datasets[2].data = yDataSMA[1];
          scoreChartObj.data.datasets[3].data = yDataSMA[2];
          scoreChartObj.data.datasets[4].data = yDataSMA[3];
          // scoreChartObj.data.datasets[0].pointStyle = pointStyle;
          scoreChartObj.update();

          score3xChartObj.data.labels = labels;
          score3xChartObj.data.datasets[0].data = yData3X;
          score3xChartObj.data.datasets[1].data = yDataSMA3X[0];
          score3xChartObj.data.datasets[2].data = yDataSMA3X[1];
          score3xChartObj.data.datasets[3].data = yDataSMA3X[2];
          score3xChartObj.data.datasets[4].data = yDataSMA3X[3];
          // scoreChartObj.data.datasets[0].pointStyle = pointStyle;
          score3xChartObj.update();


          const payouts = scoreData.slice(-100).map(p => p.nextScore);
          const shortDirection = checkTrendDirection(payouts, 10);
          const longDirection = checkTrendDirection(payouts, 25);
          const longDirection2 = checkTrendDirection(payouts, 40);

          setDirections([shortDirection, longDirection, longDirection2]);
        }

        if (json.command == 'currentmoonpayouts') {
          const {
            result
          } = json;




          if (result.length == 0) return;
          payoutData = result;
          setCurrentScoreData(payoutData);
          if (payoutData) {
            const subData = payoutData.slice(currentPercentCount * -1);
            let x1Count = 0, x2Count = 0, x3Count = 0, x4Count = 0, x5Count = 0, x6Count = 0, x10Count = 0;
            subData.map(p => {
              if (p < 2) {
                x1Count++;
              } else if (p < 3) {
                x2Count++;
              } else if (p < 4) {
                x2Count++;
                x3Count++;
              } else if (p < 5) {
                x2Count++;
                x3Count++;
                x4Count++;
              } else if (p < 6) {
                x2Count++;
                x3Count++;
                x4Count++;
                x5Count++;
              } else if (p < 10) {
                x2Count++;
                x3Count++;
                x4Count++;
                x5Count++;
                x6Count++;
              } else {
                x2Count++;
                x3Count++;
                x4Count++;
                x5Count++;
                x6Count++;
                x10Count++;
              }
            })
            setPercent({
              x1: (x1Count * 100) / subData.length,
              x2: (x2Count * 100) / subData.length,
              x3: (x3Count * 100) / subData.length,
              x4: (x4Count * 100) / subData.length,
              x5: (x5Count * 100) / subData.length,
              x6: (x6Count * 100) / subData.length,
              x10: (x10Count * 100) / subData.length,

            })
          }
          let sum = 0;
          let labels = [];
          let yData5SMA = [];
          let yData = result.map((payout, index) => {
            // console.log('ROW--', row);
            labels.push(index);
            //pointStyle.push(row.strategy == undefined ? 'circle' : 'circle')
            if (payout < 3) {
              sum += -1;
            }
            else {
              sum += 2;
            }

            return sum;
          });


          payoutChartObj.data.labels = labels;
          payoutChartObj.data.datasets[0].data = yData;

          // scoreChartObj.data.datasets[0].pointStyle = pointStyle;
          payoutChartObj.update();
        }

        if (json.command == 'mooncheck') {

          const { result } = json;
          setMoonCheckResult(result);

        }
      } catch (err) {

      }



    }

    socket.onclose = function (event) {
      setTimeout(() => {
        initializeSocket();
      }, 3000)
    };
  }


  useEffect(() => {
    if (!initialized) {
      initialized = true;


      scoreChartObj = new Chart(
        document.getElementById('scoreChart'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {

                  // if (scoreData) {
                  //   const strategy = scoreData[ctx.index].strategy;
                  //   if (strategy == undefined) {
                  //     return 'circle'
                  //   }

                  //   return 'rectRot'
                  // }

                  return 'circle'

                },
                backgroundColor: (ctx) => {

                  if (scoreData) {
                    const score = scoreData[ctx.index].nextScore;
                    // const score = scoreData[ctx.index];


                    if (score < 2) {
                      return 'red'
                    } else if (score < 3) {
                      return 'green'
                    } else if (score < 10) {
                      return 'pink'
                    } else if (score < 100) {
                      return 'yellow'
                    } else
                      return 'blue'

                  }

                  return 'blue'

                },
                pointRadius: 7,
              }
              ,
              {
                label: '5 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '10 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '20 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },
              {
                label: '5 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'red'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
              const points = scoreChartObj.getElementsAtEventForMode(evt, 'point', { intersect: true }, true);

              if (points.length >= 1) {

                const trendData = scoreData.slice(points[0].index - 30, points[0].index + 1);
                const payouts = trendData.map(t => t.nextScore);
                const payoutResult = sortValues(payouts, (v) => {
                  return v >= 2 ? 1 : 0 // 1 is green, 0 is red
                });

                setCurrentTrends(payoutResult);
                console.log('payoutResult', payoutResult);
                setCurrentBetting(scoreData[points[0].index]);

              }
              // const canvasPosition = Chart.helpers.getRelativePosition(e, scoreChartObj);

              // // Substitute the appropriate scale IDs
              // const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
              // const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = scoreData[item.parsed.x];

                    // const trendData = scoreData.slice(item.parsed.x - 40, item.parsed.x + 1);
                    // const payouts = trendData.map(t => t.nextScore);
                    // const shortDirection = checkTrendDirection(payouts, 10);
                    // const longDirection = checkTrendDirection(payouts, 25);
                    // const longDirection2 = checkTrendDirection(payouts, 40);

                    // var date = new Date(data.created || 0);

                    // // Hours part from the timestamp
                    // var hours = date.getHours();

                    // // Minutes part from the timestamp
                    // var minutes = "0" + date.getMinutes();

                    // // Seconds part from the timestamp
                    // var seconds = "0" + date.getSeconds();

                    // // Will display time in 10:30:23 format
                    // var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    // return `Next Score: ${data.nextScore}\nTime: ${formattedTime}
                    // // \nSTRATEGY: ${data.strategy}
                    // // \nTOTAL LOSE: ${data.totalLoseOf3Deep}
                    // // \nDIRECTION: ${shortDirection} / ${longDirection} / ${longDirection2}
                    // // \nAI SCORES: ${data.aiScore} / ${data.aiScore2} / ${data.aiScore3x}
                    // \nAI SCORES2: ${getExpectedPayout(data.aiScore)} / ${getExpectedPayout(data.aiScore2)} / ${getExpectedPayout(data.aiScore3x)}`

                    return `PAYOUT: ${data.nextScore}`
                  },
                }
              }
            }
          }
        }
      );

      score3xChartObj = new Chart(
        document.getElementById('score3xChart'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {

                  // if (scoreData) {
                  //   const strategy = scoreData[ctx.index].strategy;
                  //   if (strategy == undefined) {
                  //     return 'circle'
                  //   }

                  //   return 'rectRot'
                  // }

                  return 'circle'

                },
                backgroundColor: (ctx) => {

                  if (scoreData) {
                    const score = scoreData[ctx.index].nextScore;
                    // const score = scoreData[ctx.index];


                    if (score < 2) {
                      return 'red'
                    } else if (score < 3) {
                      return 'green'
                    } else if (score < 10) {
                      return 'pink'
                    } else if (score < 100) {
                      return 'yellow'
                    } else
                      return 'blue'

                  }

                  return 'blue'

                },
                pointRadius: 7,
              }
              ,
              {
                label: '5 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '10 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '20 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },
              {
                label: '30 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'red'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
              const points = score3xChartObj.getElementsAtEventForMode(evt, 'point', { intersect: true }, true);

              if (points.length >= 1) {

                const trendData = scoreData.slice(points[0].index - 30, points[0].index + 1);
                const payouts = trendData.map(t => t.nextScore);
                const payoutResult = sortValues(payouts, (v) => {
                  return v >= 2 ? 1 : 0 // 1 is green, 0 is red
                });

                setCurrentTrends(payoutResult);
                console.log('payoutResult', payoutResult);
                setCurrentBetting(scoreData[points[0].index]);

              }
              // const canvasPosition = Chart.helpers.getRelativePosition(e, score3xChartObj);

              // // Substitute the appropriate scale IDs
              // const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
              // const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = scoreData[item.parsed.x];

                    // const trendData = scoreData.slice(item.parsed.x - 40, item.parsed.x + 1);
                    // const payouts = trendData.map(t => t.nextScore);
                    // const shortDirection = checkTrendDirection(payouts, 10);
                    // const longDirection = checkTrendDirection(payouts, 25);
                    // const longDirection2 = checkTrendDirection(payouts, 40);

                    // var date = new Date(data.created || 0);

                    // // Hours part from the timestamp
                    // var hours = date.getHours();

                    // // Minutes part from the timestamp
                    // var minutes = "0" + date.getMinutes();

                    // // Seconds part from the timestamp
                    // var seconds = "0" + date.getSeconds();

                    // // Will display time in 10:30:23 format
                    // var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    // return `Next Score: ${data.nextScore}\nTime: ${formattedTime}
                    // \nSTRATEGY: ${data.strategy}
                    // \nTOTAL LOSE: ${data.totalLoseOf3Deep}
                    // \nDIRECTION: ${shortDirection} / ${longDirection} / ${longDirection2}
                    // \nAI SCORES: ${data.aiScore} / ${data.aiScore2} / ${data.aiScore3x}
                    // \nAI SCORES2: ${getExpectedPayout(data.aiScore)} / ${getExpectedPayout(data.aiScore2)} / ${getExpectedPayout(data.aiScore3x)}`
                  },
                }
              }
            }
          }
        }
      );

      payoutChartObj = new Chart(
        document.getElementById('payoutChart'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'

                },
                backgroundColor: (ctx) => {

                  if (payoutData) {
                    const score = payoutData[ctx.index];
                    // const score = scoreData[ctx.index];


                    if (score < 2) {
                      return 'red'
                    } else if (score < 3) {
                      return 'green'
                    } else if (score < 10) {
                      return 'pink'
                    } else if (score < 100) {
                      return 'yellow'
                    } else
                      return 'blue'

                  }

                  return 'blue'

                },
                pointRadius: 7,
              }
            ]
          },
          options: {
            onClick: (evt) => {
              const points = payoutChartObj.getElementsAtEventForMode(evt, 'point', { intersect: true }, true);

              if (points.length >= 1) {

                const trendData = payoutData.slice(points[0].index - 30, points[0].index + 1);
                const payouts = trendData;
                const payoutResult = sortValues(payouts, (v) => {
                  return v >= 2 ? 1 : 0 // 1 is green, 0 is red
                });

                setCurrentTrends(payoutResult);
                console.log('payoutResult', payoutResult);
                // setCurrentBetting(scoreData[points[0].index]);
              }
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = payoutData[item.parsed.x];

                    const trendData = payoutData.slice(item.parsed.x - 40, item.parsed.x + 1);
                    const payouts = trendData;
                    const shortDirection = checkTrendDirection(payouts, 10);
                    const longDirection = checkTrendDirection(payouts, 25);
                    const longDirection2 = checkTrendDirection(payouts, 40);

                    return `Next Score: ${data}\n
                    \nDIRECTION: ${shortDirection} / ${longDirection} / ${longDirection2}`
                  },
                }
              }
            }
          }
        }
      );

      const datasets = [];
      const datasets10 = [];
      const labels = ['5']
      let b = -1;
      for (let i = 0; i < predictRatesCanvas.length; i++) {
        const prateIndex = i;

        if (datasets[i] == undefined) {
          datasets[i] = [];
          datasets10[i] = [];
        }
        datasets[i].push({
          label: `Line(${prateIndex + 5})`,
          data: [], //data.map(row => row.count)
          pointStyle: (ctx) => {
            return 'circle'
          },
          backgroundColor: (ctx) => {
            if (predictRatesDataMap) {
              const data = predictRatesDataMap[prateIndex].data[ctx.index];
              if (data.payout < 2) {
                return 'red'
              } else if (data.payout < 3) {
                return 'green'
              } else if (data.payout < 10) {
                return 'green'
              } else if (data.payout < 100) {
                return 'green'
              } else {
                return 'blue'
              }

              if (data) {

                if (data.isRight == 1) {
                  return 'green'
                } else {
                  return 'red'
                }
              }
            }
          },
          pointRadius: 7,
        });

        datasets10[i].push({
          label: `Line(${prateIndex + 5})`,
          data: [], //data.map(row => row.count)
          pointStyle: (ctx) => {
            return 'circle'
          },
          backgroundColor: (ctx) => {
            if (predictRatesDataMap) {
              const data = predictRatesDataMap[prateIndex].data10[ctx.index];
              if (data.payout < 2) {
                return 'red'
              } else if (data.payout < 3) {
                return 'green'
              } else if (data.payout < 10) {
                return 'green'
              } else if (data.payout < 100) {
                return 'green'
              } else {
                return 'blue'
              }

              if (data) {

                if (data.isRight == 1) {
                  return 'green'
                } else {
                  return 'red'
                }
              }
            }
          },
          pointRadius: 7,
        });

        let colors = ['blue', 'black', 'gray'];
        for (let j = 0; j < 3; j++) {
          datasets[i].push({
            label: `${j + 1} SMA`,
            data: [], //data.map(row => row.count)
            pointStyle: (ctx) => {
              return 'circle'
            },
            borderColor: colors[j],
            backgroundColor: (ctx) => {
              return colors[j]
            },
            pointRadius: 1,
          });

          datasets10[i].push({
            label: `${j + 1} SMA`,
            data: [], //data.map(row => row.count)
            pointStyle: (ctx) => {
              return 'circle'
            },
            borderColor: colors[j],
            backgroundColor: (ctx) => {
              return colors[j]
            },
            pointRadius: 1,
          },)
        }

      }

      predictRatesCanvas.map((p, cIndex) => {
        const canvasObj = new Chart(
          document.getElementById(`predicts_${cIndex}`),
          {
            type: 'line',
            data: {
              labels: [], //data.map(row => row.year),
              datasets: datasets[cIndex]
            },
            options: {
              onClick: (evt) => {
              },
              interaction: {
                intersect: false,
                mode: 'point'
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    footer: (tooltipItems) => {

                      const item = tooltipItems[0];
                      const index = parseInt(item.datasetIndex / 4);

                      const data = predictRatesDataMap[cIndex].data.slice(0, item.parsed.x + 1);
                      console.log("COUNTS", predictRatesDataMap[cIndex].data.length);
                      console.log("DATA", data);

                      const point = predictRatesDataMap[cIndex].data[item.parsed.x];

                      let sum = 0;
                      let yData = data.map((row, index) => {
                        if (row.isRight == 1) {
                          sum += 1;
                        } else {
                          sum -= 1;
                        }
                        return sum;
                      });

                      let yDataSMA = [];
                      for (let j = 0; j < yData.length; j++) {
                        [2, 3, 4].map((count, index) => {
                          if (yDataSMA.length < (index + 1)) {
                            yDataSMA.push([]);
                          }
                          if (j < count) {
                            yDataSMA[index].push(0);
                          } else {
                            const v = yData.slice(j - count + 1, j + 1).reduce((a, b) => a + b, 0) / count;
                            yDataSMA[index].push(v);
                          }
                        })
                      }

                      let trendStatus = 2;
                      if (
                        yDataSMA[0][yDataSMA[0].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                        && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[2][yDataSMA[2].length - 1]
                      ) {
                        trendStatus = 0 //"GOOD"; // good
                      } else if (
                        yDataSMA[2][yDataSMA[2].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                        && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[0][yDataSMA[0].length - 1]
                      ) {
                        trendStatus = 1 //"BAD"; // bad
                      }

                      console.log("yDataSMA=", yDataSMA);
                      return `TREND: ${trendStatus == 0 ? "GOOD" : trendStatus == 1 ? "BAD" : "MIDDLE"}
                      \nPAYOUT: ${point.payout}
                              \nSMA2: ${yDataSMA[0][yDataSMA[0].length - 1]}, SMA3: ${yDataSMA[1][yDataSMA[1].length - 1]} SMA4: ${yDataSMA[2][yDataSMA[2].length - 1]}`
                    },
                  }
                }
              }
            }
          }
        );

        predictRatesCanvasObjs.push(canvasObj);

        const canvasObj10 = new Chart(
          document.getElementById(`predicts_${cIndex}_10`),
          {
            type: 'line',
            data: {
              labels: [], //data.map(row => row.year),
              datasets: datasets10[cIndex]
            },
            options: {
              onClick: (evt) => {
              },
              interaction: {
                intersect: false,
                mode: 'point'
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    footer: (tooltipItems) => {

                      const item = tooltipItems[0];
                      const index = parseInt(item.datasetIndex / 4);

                      const data = predictRatesDataMap[cIndex].data10.slice(0, item.parsed.x + 1);
                      console.log("COUNTS", predictRatesDataMap[cIndex].data10.length);
                      console.log("DATA", data);

                      const point = predictRatesDataMap[cIndex].data10[item.parsed.x];

                      let sum = 0;
                      let yData = data.map((row, index) => {
                        if (row.isRight == 1) {
                          sum += 1;
                        } else {
                          sum -= 1;
                        }
                        return sum;
                      });

                      let yDataSMA = [];
                      for (let j = 0; j < yData.length; j++) {
                        [2, 3, 4].map((count, index) => {
                          if (yDataSMA.length < (index + 1)) {
                            yDataSMA.push([]);
                          }
                          if (j < count) {
                            yDataSMA[index].push(0);
                          } else {
                            const v = yData.slice(j - count + 1, j + 1).reduce((a, b) => a + b, 0) / count;
                            yDataSMA[index].push(v);
                          }
                        })
                      }

                      let trendStatus = 2;
                      if (
                        yDataSMA[0][yDataSMA[0].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                        && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[2][yDataSMA[2].length - 1]
                      ) {
                        trendStatus = 0 //"GOOD"; // good
                      } else if (
                        yDataSMA[2][yDataSMA[2].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                        && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[0][yDataSMA[0].length - 1]
                      ) {
                        trendStatus = 1 //"BAD"; // bad
                      }

                      console.log("yDataSMA=", yDataSMA);
                      return `TREND: ${trendStatus == 0 ? "GOOD" : trendStatus == 1 ? "BAD" : "MIDDLE"}
                      \nPAYOUT: ${point.payout}
                              \nSMA2: ${yDataSMA[0][yDataSMA[0].length - 1]}, SMA3: ${yDataSMA[1][yDataSMA[1].length - 1]} SMA4: ${yDataSMA[2][yDataSMA[2].length - 1]}`
                    },
                  }
                }
              }
            }
          }
        );
        predictRatesCanvasObjs10.push(canvasObj10);

      });

      engineChartGoodObj = new Chart(
        document.getElementById('engineChartGood'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: datasets[0]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {

                    const item = tooltipItems[0];
                    const index = parseInt(item.datasetIndex / 4);
                    const data = predictRatesData[index].slice(0, item.parsed.x + 1);

                    const point = predictRatesData[index][item.parsed.x];

                    let sum = 0;
                    let yData = data.map((row, index) => {
                      if (row.isRight == 1) {
                        sum += 1;
                      } else {
                        sum -= 1;
                      }
                      return sum;
                    });

                    let yDataSMA = [];
                    for (let j = 0; j < yData.length; j++) {
                      [2, 3, 4].map((count, index) => {
                        if (yDataSMA.length < (index + 1)) {
                          yDataSMA.push([]);
                        }
                        if (j < count) {
                          yDataSMA[index].push(0);
                        } else {
                          const v = yData.slice(j - count + 1, j + 1).reduce((a, b) => a + b, 0) / count;
                          yDataSMA[index].push(v);
                        }
                      })
                    }

                    let trendStatus = 2;
                    if (
                      yDataSMA[0][yDataSMA[0].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[2][yDataSMA[2].length - 1]
                    ) {
                      trendStatus = 0 //"GOOD"; // good
                    } else if (
                      yDataSMA[2][yDataSMA[2].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[0][yDataSMA[0].length - 1]
                    ) {
                      trendStatus = 1 //"BAD"; // bad
                    }


                    return `TREND: ${trendStatus == 0 ? "GOOD" : trendStatus == 1 ? "BAD" : "MIDDLE"}
                    \nPAYOUT: ${point.payout}
                            \nSMA2: ${yDataSMA[0][yDataSMA[0].length - 1]}, SMA3: ${yDataSMA[1][yDataSMA[1].length - 1]} SMA4: ${yDataSMA[2][yDataSMA[2].length - 1]}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartBadObj = new Chart(
        document.getElementById('engineChartBad'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: datasets[1]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];

                    const index = parseInt(item.datasetIndex / 4);
                    const data = predictRatesData[2].slice(0, item.parsed.x + 1);

                    const point = predictRatesData[2][item.parsed.x];

                    let sum = 0;
                    let yData = data.map((row, index) => {
                      if (row == 1) {
                        sum += 1;
                      } else {
                        sum -= 1;
                      }
                      return sum;
                    });

                    let yDataSMA = [];
                    for (let j = 0; j < yData.length; j++) {
                      [2, 3, 4].map((count, index) => {
                        if (yDataSMA.length < (index + 1)) {
                          yDataSMA.push([]);
                        }
                        if (j < count) {
                          yDataSMA[index].push(0);
                        } else {
                          const v = yData.slice(j - count + 1, j + 1).reduce((a, b) => a + b, 0) / count;
                          yDataSMA[index].push(v);
                        }
                      })
                    }

                    let trendStatus = 2;
                    if (
                      yDataSMA[0][yDataSMA[0].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[2][yDataSMA[2].length - 1]
                    ) {
                      trendStatus = 0 //"GOOD"; // good
                    } else if (
                      yDataSMA[2][yDataSMA[2].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[0][yDataSMA[0].length - 1]
                    ) {
                      trendStatus = 1 //"BAD"; // bad
                    }


                    return `TREND: ${trendStatus == 0 ? "GOOD" : trendStatus == 1 ? "BAD" : "MIDDLE"}
                    \nPAYOUT: ${point.payout}
                            \nSMA2: ${yDataSMA[0][yDataSMA[0].length - 1]}, SMA3: ${yDataSMA[1][yDataSMA[1].length - 1]} SMA4: ${yDataSMA[2][yDataSMA[2].length - 1]}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartMidObj = new Chart(
        document.getElementById('engineChartMid'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: datasets[2]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];

                    const index = parseInt(item.datasetIndex / 4);
                    const data = predictRatesData[1].slice(0, item.parsed.x + 1);

                    const point = predictRatesData[1][item.parsed.x];


                    let sum = 0;
                    let yData = data.map((row, index) => {
                      if (row == 1) {
                        sum += 1;
                      } else {
                        sum -= 1;
                      }
                      return sum;
                    });

                    let yDataSMA = [];
                    for (let j = 0; j < yData.length; j++) {
                      [2, 3, 4].map((count, index) => {
                        if (yDataSMA.length < (index + 1)) {
                          yDataSMA.push([]);
                        }
                        if (j < count) {
                          yDataSMA[index].push(0);
                        } else {
                          const v = yData.slice(j - count + 1, j + 1).reduce((a, b) => a + b, 0) / count;
                          yDataSMA[index].push(v);
                        }
                      })
                    }

                    let trendStatus = 2;
                    if (
                      yDataSMA[0][yDataSMA[0].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[2][yDataSMA[2].length - 1]
                    ) {
                      trendStatus = 0 //"GOOD"; // good
                    } else if (
                      yDataSMA[2][yDataSMA[2].length - 1] > yDataSMA[1][yDataSMA[1].length - 1]
                      && yDataSMA[1][yDataSMA[1].length - 1] > yDataSMA[0][yDataSMA[0].length - 1]
                    ) {
                      trendStatus = 1 //"BAD"; // bad
                    }


                    return `TREND: ${trendStatus == 0 ? "GOOD" : trendStatus == 1 ? "BAD" : "MIDDLE"}
                    \nPAYOUT: ${point.payout}
                            \nSMA2: ${yDataSMA[0][yDataSMA[0].length - 1]}, SMA3: ${yDataSMA[1][yDataSMA[1].length - 1]} SMA4: ${yDataSMA[2][yDataSMA[2].length - 1]}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj3 = new Chart(
        document.getElementById('engineChartTest3'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData3) {
                    const data = engineData3[ctx.index];
                    const data0 = engineData3[ctx.index - 1];
                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData3) {
                    const data = engineData3[ctx.index];

                    const data0 = engineData1[ctx.index - 1];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {

            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData3[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
  TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
  E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
  ${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
  BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartBCObj = new Chart(
        document.getElementById('engineChartBC'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData4) {
                    const data = engineData4[ctx.index];
                    const data0 = engineData4[ctx.index - 1];
                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData4) {
                    const data = engineData4[ctx.index];


                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {

            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData4[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
  TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
  E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
  ${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
  BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj1 = new Chart(
        document.getElementById('engineChartTest1'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData1) {
                    const data = engineData1[ctx.index];
                    const data0 = engineData1[ctx.index - 1];
                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData1) {
                    const data = engineData1[ctx.index];

                    const data0 = engineData1[ctx.index - 1];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
              const points = engineChartObj1.getElementsAtEventForMode(evt, 'point', { intersect: true }, true);

              if (points.length >= 1) {

                console.log(points[0])

                if (points[0].datasetIndex != 0) return;

                let data = engineData1.slice(points[0].index - 10, points[0].index + 1);

                let rightCount = 0;
                data.slice(mainBranchPercentCount).map(p => {
                  if (p.isRight == 1) {
                    rightCount++;
                  }
                });
                clickedPoint = true;
                console.log("ENGINE1", rightCount, data.slice(mainBranchPercentCount).length);

                setEngineData1P(rightCount * 100 / data.slice(mainBranchPercentCount).length);


                data = engineData2.slice(points[0].index - 10, points[0].index + 1);

                rightCount = 0;
                data.slice(mainBranchPercentCount).map(p => {
                  if (p.isRight == 1) {
                    rightCount++;
                  }
                });

                console.log("ENGINE2", rightCount, data.slice(mainBranchPercentCount).length);

                setEngineData2P(rightCount * 100 / data.slice(mainBranchPercentCount).length);


                data = engineData3.slice(points[0].index - 10, points[0].index + 1);

                rightCount = 0;
                data.slice(mainBranchPercentCount).map(p => {
                  if (p.isRight == 1) {
                    rightCount++;
                  }
                });

                console.log("ENGINE3", rightCount, data.slice(mainBranchPercentCount).length);

                setEngineData3P(rightCount * 100 / data.slice(mainBranchPercentCount).length);

                data = engineData.slice(points[0].index - 10, points[0].index + 1);

                rightCount = 0;
                data.slice(mainBranchPercentCount).map(p => {
                  if (p.isRight == 1) {
                    rightCount++;
                  }
                });

                console.log("ENGINE", rightCount, data.slice(mainBranchPercentCount).length);

                setEngineDataP(rightCount * 100 / data.slice(mainBranchPercentCount).length);
              }
              // const canvasPosition = Chart.helpers.getRelativePosition(e, scoreChartObj);

              // // Substitute the appropriate scale IDs
              // const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
              // const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData1[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj2 = new Chart(
        document.getElementById('engineChartTest2'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData2) {
                    const data = engineData2[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData2) {
                    const data = engineData2[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData2[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      branchChart = new Chart(
        document.getElementById('branchChart'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (branchChartData) {
                    const data = branchChartData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (branchChartData) {
                    const data = branchChartData[ctx.index];
                    // const score = scoreData[ctx.index];


                    const score = data.payout

                    if (score < 2) {
                      return 'red'
                    } else if (score < 3) {
                      return 'green'
                    } else if (score < 10) {
                      return 'pink'
                    } else if (score < 100) {
                      return 'yellow'
                    } else {
                      return 'blue'
                    }

                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = branchChartData[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj3X = new Chart(
        document.getElementById('engineChartTest3X'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData3X) {
                    const data = engineData3X[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 3 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData3X) {
                    const data = engineData3X[ctx.index];


                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {

            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData3X[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
  TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
  E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
  ${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
  BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj2X = new Chart(
        document.getElementById('engineChartTest2X'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData2X) {
                    const data = engineData2X[ctx.index];

                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 3 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData2X) {
                    const data = engineData2X[ctx.index];


                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {

            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData2X[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
  TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
  E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
  ${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
  BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartFinalObj = new Chart(
        document.getElementById('engineChartFinal'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData) {
                    const data = engineData[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData) {
                    const data = engineData[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj1Min = new Chart(
        document.getElementById('engineChartTest1Min'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData1Min) {
                    const data = engineData1Min[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData1Min) {
                    const data = engineData1Min[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData1Min[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj3Min = new Chart(
        document.getElementById('engineChartTest3Min'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData3Min) {
                    const data = engineData3Min[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData3Min) {
                    const data = engineData3Min[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData3Min[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartObj2Min = new Chart(
        document.getElementById('engineChartTest2Min'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineData2Min) {
                    const data = engineData2Min[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineData2Min) {
                    const data = engineData2Min[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineData2Min[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartBCObjMin = new Chart(
        document.getElementById('engineChartBCMin'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineDataBCMin) {
                    const data = engineDataBCMin[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineDataBCMin) {
                    const data = engineDataBCMin[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineDataBCMin[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      engineChartBranchMinObj = new Chart(
        document.getElementById('engineChartBranchMin'),
        {
          type: 'line',
          data: {
            labels: [], //data.map(row => row.year),
            datasets: [
              {
                label: '3X Line',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  if (engineDataBCMin) {
                    const data = engineDataBCMin[ctx.index];

                    // const score = scoreData[ctx.index];
                    const score = data.payout;
                    const bettingType = data.bettingType;
                    if ((score >= 2 && bettingType == 2) || (score < 2 && bettingType == 1)) {
                      return 'rectRot'
                    }
                    if (!data.isRight && data.betOrNot == 0) {
                      return 'rect'
                    }
                  }

                  return 'circle'
                },
                backgroundColor: (ctx) => {

                  if (engineDataBCMin) {
                    const data = engineDataBCMin[ctx.index];
                    // const score = scoreData[ctx.index];
                    if (data.betOrNot == 1) { // win
                      if (data.isRight == 1) { // bet
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }


                      } else {
                        const score = data.payout

                        if (score < 2) {
                          return 'red'
                        } else if (score < 3) {
                          return 'green'
                        } else if (score < 10) {
                          return 'pink'
                        } else if (score < 100) {
                          return 'yellow'
                        } else {
                          return 'blue'
                        }
                      }

                    }
                    return 'grey'
                  }

                },
                pointRadius: 7,
              }
              ,
              {
                label: '1 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'blue',
                backgroundColor: (ctx) => {
                  return 'blue'
                },
                pointRadius: 1,
              },
              {
                label: '2 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'black',
                backgroundColor: (ctx) => {
                  return 'black'
                },
                pointRadius: 1,
              },

              {
                label: '3 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'gray',
                backgroundColor: (ctx) => {
                  return 'gray'
                },
                pointRadius: 1,
              },

              {
                label: '6 SMA',
                data: [], //data.map(row => row.count)
                pointStyle: (ctx) => {
                  return 'circle'
                },
                borderColor: 'red',
                backgroundColor: (ctx) => {
                  return 'yellow'
                },
                pointRadius: 1,
              }
            ]
          },
          options: {
            onClick: (evt) => {
            },
            interaction: {
              intersect: false,
              mode: 'point'
            },
            plugins: {
              tooltip: {
                callbacks: {
                  footer: (tooltipItems) => {
                    const item = tooltipItems[0];
                    const data = engineDataBCMin[item.parsed.x];
                    return `INDEX: ${data.currentIndex}, PAYOUT: ${data.payout}, 
TREND: ${data.engineTrend == 0 ? "GOOD" : data.engineTrend == 1 ? "BAD" : "MIDDLE"}
E-TREND: ${data.entireTrend == 0 ? "GOOD" : data.entireTrend == 1 ? "BAD" : "MIDDLE"}
${data[3] ? `SMA2: ${data[3][0]}, SMA3: ${data[3][1]}, SMA4: ${data[3][2]}` : ''}
BET AMOUNT: ${data.betAmount}`
                  },
                }
              }
            }
          }
        }
      );

      initializeSocket();
    }

    if (filterTypeOfMoon == 'green') {
      filterData(true, 1, filterElMoonPatternRef.current.value.trim())
    } else if (filterTypeOfMoon == 'red') {
      filterData(true, 0, filterElMoonPatternRef.current.value.trim())
    } else if (filterTypeOfMoon == '' || filterTypeOfMoon == 'none' || filterTypeOfMoon == undefined) {
      setMoonDataFilter(moonData);
    }

    if (filterTypeOfKill == 'green') {
      filterData(false, 1, filterElKillPatternRef.current.value.trim())
    } else if (filterTypeOfKill == 'red') {
      filterData(false, 0, filterElKillPatternRef.current.value.trim())
    } else if (filterTypeOfKill == '' || filterTypeOfKill == 'none' || filterTypeOfKill == undefined) {
      setKillDataFilter(killData);
    }


  }, [moonData, killData, chartType]);

  const resetOptions = (data = {}) => {

    const options = {
      command: 'reset',
      initialBet: initialBet,
      initialPayout: initialPayout,
      maxAmount,
      mainBranch,
      martingaleCount,
      currentBet2X,
      deposit
    }
    
    const updatedOption = Object.assign(options, data);
    socket.send(JSON.stringify(updatedOption))
  }

  const onClickChart = (idx) => {
    if (activatedCharts.includes(idx)) {
      const index = activatedCharts.findIndex(p => p == idx);
      activatedCharts.splice(index, 1);
    } else {
      activatedCharts.push(idx);
    }

    socket.send(JSON.stringify({
      command: 'setbranches',
      branches: activatedCharts
    }));
  }

  const onClickBranch = (index) => {
    setCurrentBranch(index);
    currentBranchIndex = index;
    let bIndex = 100000;
    let whileCount = 3;
    let isIncludeBranch = false;
    while (bIndex != -1) {
      bIndex = activatedCharts.findIndex(p => p >= 100);


      console.log("B INDEX", bIndex);
      if (bIndex != -1) {
        isIncludeBranch = true;
        activatedCharts.splice(bIndex, 1);
      }
    }

    if (isIncludeBranch) {
      activatedCharts.push(index + 100);
      socket.send(JSON.stringify({
        command: 'setbranches',
        branches: activatedCharts
      }));
    }

  }
  const onClickPayouts = (hash) => {
    socket.send(JSON.stringify({
      command: 'getpayouts',
      hash
    }));
  }
  const checkTrendDirection = (payouts, count = 0) => {
    const lastPayouts = payouts.slice(count * -1);
    let sum = 0;
    lastPayouts.map(p => {
      if (p >= 3) {
        sum = sum + 2
      } else {
        sum = sum - 1
      }
    })

    return sum;

  }
  const betting = (cost) => {
    socket.send(JSON.stringify({
      command: 'betting',
      cost
    }));


  }

  const up2x = () => {
    socket.send(JSON.stringify({
      command: 'up2x'
    }));
  }

  const down2x = () => {
    socket.send(JSON.stringify({
      command: 'down2x'
    }));
  }



  const setAutoCheckout = (v) => {

    socket.send(JSON.stringify({
      command: 'autoCheckout',
      value: v
    }));
  }

  const setEnableBetting = (v) => {
    isBettingEnable = v;
    socket.send(JSON.stringify({
      command: 'isbettingenabled',
      value: v
    }));
  }

  const setOpacity = (v) => {
    socket.send(JSON.stringify({
      command: 'hidden',
      opacity: v == 1 ? 1 : 0.01
    }));
  }

  const setAutoReset = (v) => {
    isAutoReset = v;
    socket.send(JSON.stringify({
      command: 'autoreset',
      value: v == 1 ? 1 : 0
    }));
  }

  const setAutoUp = (v) => {
    isAutoUp = v;
    socket.send(JSON.stringify({
      command: 'autoup',
      value: v == 1 ? 1 : 0
    }));
  }

  const setTrenball2X = (v) => {
    isTrenball2X = v;
    socket.send(JSON.stringify({
      command: 'istrenball2x',
      value: v == 1 ? 1 : 0
    }));
  }

  const setTrenball1X = (v) => {
    isTrenball1X = v;
    socket.send(JSON.stringify({
      command: 'istrenball1x',
      value: v == 1 ? 1 : 0
    }));
  }



  const setOnlyAfterRed = (v) => {
    socket.send(JSON.stringify({
      command: 'onlyafterred',
      value: v == 1 ? 1 : 0
    }));
  }

  const setMartingale = (v) => {
    socket.send(JSON.stringify({
      command: 'martingale',
      value: v == 1 ? 1 : 0
    }));
  }


  const cancel = () => {
    socket.send(JSON.stringify({
      command: 'cancel'
    }));
  }

  const sell = (id) => {
    socket.send(JSON.stringify({
      command: 'sell',
      id: id
    }))
  }

  const sellAll = () => {
    socket.send(JSON.stringify({
      command: 'sellall'
    }))
  }

  const checkPattern = (patternValue, deep, color) => {
    // check color
    if (patternValue.toString().includes('g')) {
      if (color == 'r') return -1; // not matched but ignore it
    } else if (patternValue.toString().includes('r')) {
      if (color == 'g') return -1; // not matched but ignore it
    }

    if (patternValue.toString().includes('+')) {
      // it means over
      if (deep >= parseInt(patternValue.toString())) {
        return 1;
      }
      if (patternValue.toString().includes('g') || patternValue.toString().includes('r')) return -1

    } else if (patternValue.toString().includes('-')) {
      // it means over
      if (deep <= parseInt(patternValue.toString())) {
        return 1;
      }
      if (patternValue.toString().includes('g') || patternValue.toString().includes('r')) return -1

    } else {
      if (parseInt(patternValue.toString()) == deep) return 1
      if (patternValue.toString().includes('g') || patternValue.toString().includes('r'))
        return -1
      else
        return 0;
    }

    return 0;
  }

  const checkTrend = (values, pItem) => {
    let currentValueIndex = 0;
    for (let j = 0; j < pItem.deeps.length; j++) {
      if (values[currentValueIndex] == undefined) return null;

      let patternType = checkPattern(pItem.deeps[j], values[currentValueIndex].length, values[currentValueIndex][0] >= 2 ? 'g' : 'r')

      if (patternType == 1) {
        currentValueIndex++;
      } else if (patternType == 0) { // not matched
        return false
      } else { // ignore
        currentValueIndex++;
        j--;
        continue
      }

      if (j == pItem.deeps.length - 1) {
        return true;
      }
    }
    return false;
  }

  const sortValues = (data, sortFuc, basePayout = 2) => {
    if (data.length == 0) return;
    let position = data.length;
    let currentIndex = position - 1;
    let cColor = sortFuc(data[currentIndex]); // >= 2 ? 1 : 0 // 1 is green, 0 is red
    let currentColor = cColor;
    let values = [[data[currentIndex]]]

    currentIndex--;

    while (currentIndex >= 0) {
      if (data[currentIndex] >= basePayout) {
        if (currentColor == 1) {
          // same color, need to push
          values[values.length - 1].unshift(data[currentIndex]);
        } else {
          // different color, need to initialize new array and push it
          values.push([data[currentIndex]]);
        }
        currentColor = 1
      } else {
        if (currentColor == 0) {
          // same color, need to push
          values[values.length - 1].unshift(data[currentIndex]);
        } else {
          // different color, need to initialize new array and push it
          values.push([data[currentIndex]]);
        }
        currentColor = 0
      }

      currentIndex--;
      if (values.length > 20) break;
    }

    const v = {
      color: cColor,
      values
    }
    return v;
  }

  const getNextWinStatus = (moon) => {
    for (let i = 0; i < moon.nextScore.length; i++) {
      if (moon.nextScore[i] >= 3) return true;
    }

    return false;
  }

  const filterData = (isMoonOrKill, cColor, pattern, score = '', minProfit = '-1000000000000', maxProfit = '1000000000000'
    , minProfit2 = '-1000000000000', maxProfit2 = '1000000000000'
    , minProfit4 = '-1000000000000', maxProfit4 = '1000000000000'
  ) => {
    console.log('PATTERN-----------', cColor, pattern);
    const targetData = isMoonOrKill ? moonData : killData;
    setCurrentColor(cColor);
    let filteredData = [];


    let totalBettingCount = 0;
    let totalWinCount = 0;
    let totalLoseCount = 0;
    let total2XWinCount = 0;


    filteredData = targetData.filter((moon, index) => {
      moon.nextScore = [];
      moon.nextMoons = [];
      for (let i = 1; i < 3; i++) {

        if (targetData[index + i]) {
          moon.nextScore.push(targetData[index + i].score);
          moon.nextMoons.push(targetData[index + i]);
        }
      }

      if (score != '') {
        if (moon.score < parseFloat(score))
          return false;
      }

      // let isBettingEnable = false;
      // if (moon.sum02 < 800 && moon.sum1 > 12000) {
      //   isBettingEnable = true;
      // }

      // if (isBettingEnable == false) return;
      console.log('SCORE============', score)

      if (minProfit == '') {
        minProfit = '-1000000000000';
      }

      if (maxProfit == '') {
        maxProfit = '1000000000000';
      }
      minProfit = parseFloat(minProfit);
      maxProfit = parseFloat(maxProfit);

      if (minProfit2 == '') {
        minProfit2 = '-1000000000000';
      }

      if (maxProfit2 == '') {
        maxProfit2 = '1000000000000';
      }
      minProfit2 = parseFloat(minProfit2);
      maxProfit2 = parseFloat(maxProfit2);


      if (minProfit4 == '') {
        minProfit4 = '-1000000000000';
      }

      if (maxProfit4 == '') {
        maxProfit4 = '1000000000000';
      }
      minProfit4 = parseFloat(minProfit4);
      maxProfit4 = parseFloat(maxProfit4);



      if (moon.profits.length >= 3) {

        // const lastProfit = moon.profits[moon.profits[0].length > 1 ? 1 : 2] && moon.profits[moon.profits[0].length > 1 ? 1 : 2].reduce((accumulator, currentValue) => {
        //   return accumulator + currentValue
        // }, 0)

        let lastProfit = moon.sum1;
        //  moon.profits.map((p, index) => {
        //   if (index > 2) return 0;
        //   return p.reduce((accumulator, currentValue) => {
        //     return accumulator + currentValue
        //   }, 0)
        // }).reduce((accumulator, currentValue) => {
        //   return accumulator + currentValue
        // }, 0)
        console.log('lastProfit===', lastProfit)
        // const lastProfit = moon.profits[moon.score >= 2 ? 1 : 2] 
        //   && moon.profits[moon.score >= 2 ? 1 : 2].reduce((accumulator, currentValue) => {
        //   return accumulator + currentValue
        // }, 0);

        if (lastProfit == false) return false;
        if ((lastProfit >= minProfit && lastProfit <= maxProfit) == false) return false;
        if ((moon.sum02 >= minProfit2 && moon.sum02 <= maxProfit2) == false) return false;
        if ((moon.sum4 >= minProfit4 && moon.sum4 <= maxProfit4) == false) return false;

        // if (moon.sum02_count > 1) return false;
        // if (moon.profits[0].length > 4 && moon.profits[0][0] > 5000) return false;
      }

      if (pattern == '') {
        totalBettingCount++;
        if (moon.score < 2) {
          totalLoseCount++;
          total2XWinCount += getNextWinStatus(moon) ? 1 : 0;
        } else {
          totalWinCount++;
        }

        return true;
      }


      if (cColor == 1) {
        // it means green filter
        const json = JSON.stringify(moon.values);
        const values = JSON.parse(json);

        const cpattern = pattern.split(',')

        if (moon.values[0][0] < 2) {
          cpattern.unshift("1");
          console.log('CPATTERN', cpattern)
        } else {
          cpattern[0] = parseInt(cpattern[0].toString()) + 1;
          console.log('CPATTERN', cpattern)
        }
        let isMatched = checkTrend(values, {
          deeps: cpattern
        });

        if (isMatched) {
          totalBettingCount++;
          if (moon.score < 2) {
            totalLoseCount++;
            total2XWinCount += getNextWinStatus(moon) ? 1 : 0;
          } else {
            totalWinCount++;
          }
          return true;
        }

        return false;
      } else {
        // it means red filter
        const json = JSON.stringify(moon.values);
        const values = JSON.parse(json);
        const cpattern = pattern.split(',')
        if (moon.values[0][0] >= 2) {
          cpattern.unshift("1");
        } else {
          cpattern[0] = parseInt(cpattern[0].toString()) + 1;
        }
        // if (moon.values[0].length >= 2 && moon.values[0][0] >= 2) {
        //   values[0].pop();
        // }
        let isMatched = checkTrend(values, {
          deeps: cpattern
        })

        if (isMatched) {
          totalBettingCount++;
          if (moon.score < 2) {
            totalLoseCount++;
            total2XWinCount += getNextWinStatus(moon) ? 1 : 0;
          } else {
            totalWinCount++;
          }
          return true;
        }
      }
    });

    setTotalBet(totalBettingCount);
    setTotalWin(totalWinCount);
    setTotalLose(totalLoseCount);
    setTotal2XWin(total2XWinCount);

    setMoonDataFilter(filteredData)
  }

  const isMatchedPattern = (cColor, pattern, moon) => {
    // check pattern
    if (cColor == 1) {
      // it means green filter
      if (moon.values[0].length >= 2 && moon.values[0][0] >= 2) {

        const json = JSON.stringify(moon.values);
        const values = JSON.parse(json);
        values[0].pop();

        return checkTrend(values, {
          deeps: pattern.split(",")
        })
      }
    } else {
      // it means red filter
      if (moon.values[0].length == 1 && moon.values[0][0] >= 2) {
        const json = JSON.stringify(moon.values);
        const values = JSON.parse(json);
        values.shift();
        return checkTrend(values, {
          deeps: pattern.split(",")
        })
      }
    }
    return false;
  }
  const getExpectedPayout = (score) => {
    return parseFloat((score * 10).toFixed(2));
  }

  const getPercent = (count) => {
    if (currentScoreData == undefined || currentScoreData == null) return null;
    const subData = currentScoreData.slice(count * -1);
    let x1Count = 0, x2Count = 0, x3Count = 0, x4Count = 0, x5Count = 0, x6Count = 0, x10Count = 0;
    subData.map(p => {
      if (p < 2) {
        x1Count++;
      } else if (p < 3) {
        x2Count++;
      } else if (p < 4) {
        x2Count++;
        x3Count++;
      } else if (p < 5) {
        x2Count++;
        x3Count++;
        x4Count++;
      } else if (p < 6) {
        x2Count++;
        x3Count++;
        x4Count++;
        x5Count++;
      } else if (p < 10) {
        x2Count++;
        x3Count++;
        x4Count++;
        x5Count++;
        x6Count++;
      } else {
        x2Count++;
        x3Count++;
        x4Count++;
        x5Count++;
        x6Count++;
        x10Count++;
      }
    })
    return {
      x1: Math.floor((x1Count * 100) / subData.length),
      x2: Math.floor((x2Count * 100) / subData.length),
      x3: Math.floor((x3Count * 100) / subData.length),
      x4: Math.floor((x4Count * 100) / subData.length),
      x5: Math.floor((x5Count * 100) / subData.length),
      x6: Math.floor((x6Count * 100) / subData.length),
      x10: Math.floor((x10Count * 100) / subData.length),
    }
  }

  const getTotalBettingCount = () => {
    if (filterElMoonScoreRef.current == undefined || filterElMoonScoreRef.current == null) return 0
    if (filterElMoonMinRef3.current == undefined || filterElMoonMinRef3.current == null) return 0
    if (filterElMoonMaxRef.current == undefined || filterElMoonMaxRef.current == null) return 0

    if (filterElMoonPatternRef.current == undefined || filterElMoonPatternRef.current == null) return 0
    const pattern = filterElMoonPatternRef.current.value.trim();
    const score = parseFloat(filterElMoonScoreRef.current.value || '2');
    const minProfit = parseFloat(filterElMoonMinRef3.current.value || '-1000000000000000');
    const maxProfit = parseFloat(filterElMoonMinRef3.current.value || '1000000000000000');


    let totalBettingCount = 0;
    let totalLoseCount = 0;
    moonData.map((moon, mi) => {
      const profit10 = moon.profits.map((pa, index) => {
        if (index > 2) return 0;

        var sum = pa.reduce((accumulator, currentValue) => {
          return accumulator + currentValue
        }, 0);

        return sum;
      }).reduce((accumulator, currentValue) => {
        return accumulator + currentValue
      }, 0);

      if (profit10 <= parseFloat(maxProfit) && profit10 >= parseFloat(minProfit)) {
        if (pattern != '') {

          if (currentColor == 1) {
            // it means green filter
            if (moon.values[0].length >= 2) {
              const json = JSON.stringify(moon.values);
              const values = JSON.parse(json);
              values[0].pop();
              let deepString = values.map(v => v.length).join(',')

              if (deepString == '1,2,3,4,1,2,2,2,1,2,1,5,1,2,1,1,1,2,4,2,1')
                console.log('DEEP STRING', deepString)
              if (checkTrend(values, {
                deeps: pattern.split(",")
              }) == false) return;
            }
            return;
          } else {
            // it means red filter
            if (moon.values[0].length == 1 && moon.values[0][0] >= 2) {
              const json = JSON.stringify(moon.values);
              const values = JSON.parse(json);
              values.shift();
              if (checkTrend(values, {
                deeps: pattern.split(",")
              }) == false) return;
            }
            return;
          }
        }
        totalBettingCount++;
        let nextMoon = moonData[mi + 1];

        if (nextMoon && nextMoon.score < score) {
          totalLoseCount++;
          // let's bet again
        }
        return true;
      }
    });
    //totalLoseCount = 10;
    const v = {
      totalBettingCount,
      totalLoseCount,
      totalProfit: Math.round((totalBettingCount - totalLoseCount) * (score - 1) - totalLoseCount),
    }

    return v;
  }

  const getColor = (p) => {
    if (p >= 1) return 'yellow';
    if (p >= 0.8) return 'lime';
    if (p >= 0.7) return 'lime';

    if (p > 0.5) return 'green';

    return 'red'

  }
  const renderPredict = () => {
    if (predict == undefined) return null;


    let statusColor = status == 0 ? 'red' :
      status == 1 ? 'green' : 'yellow'


    return <div>
      <div style={{ display: 'inline-block' }}>
        {/* <div><span style={{ display: 'inline-block', width: 60, height: 15, border: '1px solid black', backgroundColor: statusColor }}>&nbsp;</span></div> */}
        <div>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[0]) }}>&nbsp;</span>
        </div>
        <div style={{ marginTop: 5 }}>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[1]) }}>&nbsp;</span>
        </div>
        <div style={{ marginTop: 5 }}>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[2]) }}>&nbsp;</span>
        </div>
      </div>

      <div style={{ display: 'inline-block', marginLeft: 40 }}>

        <div>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[3]) }}>&nbsp;</span>
        </div>
        <div style={{ marginTop: 5 }}>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[4]) }}>&nbsp;</span>
        </div>
        <div style={{ marginTop: 5 }}>
          <span style={{ border: '1px solid gray', width: 15, height: 15, borderRadius: 15, display: 'inline-block', marginLeft: 5, backgroundColor: getColor(predict[5]) }}>&nbsp;</span>
        </div>
      </div>
    </div>


    return null;

  }



  return (
    <div css={[HomePageStyle]} id='homepage'>
      <div style={{ /*flexDirection: 'row', display: 'flex', flex: 1 */ }}>
        {/* <div className='column'>
          <h1 className="title">Logs</h1>
          <div style={{ display: 'flex' }}>
            <textarea style={{ width: '100%', height: 100 }} ref={logElRef} />
          </div>
        </div> */}
        <div>
          <span>Start Point <input type='number' value={startPoint} onChange={(e) => {
            currentStartPoint = parseInt(e.target.value);
            setStartPoint(parseInt(e.target.value));
          }} />
          </span>
          <span>Pattern Counts <input type='number' value={patternCount} onChange={(e) => {
            currentCount = parseInt(e.target.value);
            setPatternCount(parseInt(e.target.value));
          }} />
          </span>
          <span>Percent Counts <input type='number' value={percentCount} onChange={(e) => {
            currentPercentCount = parseInt(e.target.value);
            // console.log('scoreData=========================', scoreData, currentScoreData);
            if (currentScoreData) {
              const subData = currentScoreData.slice(currentPercentCount * -1);
              let x1Count = 0, x2Count = 0, x3Count = 0;
              subData.map(p => {
                if (p < 2) {
                  x1Count++;
                } else if (p < 3) {
                  x2Count++;
                } else {
                  x2Count++;
                  x3Count++;
                }
              })
              setPercentCount(parseInt(e.target.value));
              percentCountGlobal = parseInt(e.target.value);

              setPercent({
                x1: (x1Count * 100) / subData.length,
                x2: (x2Count * 100) / subData.length,
                x3: (x3Count * 100) / subData.length,
              })
            }
          }} />
          </span>


          <input type={"radio"} name='chooseChart' style={{ marginLeft: 20 }} defaultChecked={chartType == 1 ? 'checked' : 'none'} onClick={(e) => {
            if (e.target.checked) {
              setChartType(1);
              // score3xChartObj.update();
              // setTimeout(() => {

              // }, 1000)
            }
          }} /> Score Chart
          <input type={"radio"} name='chooseChart' style={{ marginLeft: 20 }} defaultChecked={chartType == 2 ? 'checked' : 'none'} onClick={(e) => {
            if (e.target.checked) {
              setChartType(2);
              // score3xChartObj.update();
              // setTimeout(() => {

              // }, 1000)
            }
          }} /> Payout Chart

          <input type={"button"} style={{ marginLeft: 20 }} value='Moon Check' onClick={(e) => {
            socket.send(JSON.stringify({
              command: 'mooncheck'
            }))
          }} />
        </div>
        <div className='column'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="title">Actions <span>{renderPredict()}</span></h1>
          </div>
          <div>
            <input type='button' value='   RUN   ' className='mt-10 mr-10' onClick={() => {
              betting(0)
            }} />



            <input type='button' value='CANCEL' className='mt-10 mr-10' onClick={() => {
              cancel()
            }} />

            <input type='button' value='UP x2' className='mr-10' onClick={() => {
              up2x()
            }} />
            <input type='button' value='DOWN /2' className='mr-10' onClick={() => {
              down2x()
            }} />

            <input type='button' value='RUN BOTH' className='mt-10 mr-10' onClick={() => {
              betting(9)
            }} />

            <input type='checkbox' value={1} className='mr-10' onClick={(e) => {
              setAutoCheckout(e.target.checked ? 1 : 0);
            }} /> Auto Checkout? &nbsp;&nbsp;&nbsp;


          </div>

          <div className='mt-10'>
            <input type='button' className='mr-10' value='SELL 1' onClick={() => {
              sell('1');
            }} />

            <input type='button' className='mr-10' value='SELL 2' onClick={() => {
              sell('2');
            }} />

            <input type='button' value='SELL ALL' onClick={() => {
              sellAll();
            }} />
          </div>

          <div className='mt-10'>
            <input type='button' className='mr-10' value='EXPORT LOSE AMOUNT' onClick={() => {
              socket.send(JSON.stringify({
                command: 'exportloseamount'
              }))
            }} />

            <input type='button' className='mr-10' value='EXPORT MOON PATTERN' onClick={() => {
              socket.send(JSON.stringify({
                command: 'exportmoon'
              }))
            }} />

            <input type='button' className='mr-10' value='EXPORT RED PATTERN' onClick={() => {
              socket.send(JSON.stringify({
                command: 'exportred'
              }))
            }} />

            <input type='button' className='mr-10' value='APPLY PAYOUT MOON' onClick={() => {
              socket.send(JSON.stringify({
                command: 'applypayoutmoon'
              }))
            }} />

            <input type='button' className='mr-10' value='APPLY PAYOUT RED' onClick={() => {
              socket.send(JSON.stringify({
                command: 'applypayoutred'
              }))
            }} />
          </div>

        </div>
        <div>
          <table>
            <thead>
              <th style={{ width: 40 }}>Index</th>
              <th style={{ width: 40 }}>SMA2</th>
              <th style={{ width: 40 }}>Rate5</th>
              <th style={{ width: 40 }}>Rate All</th>
              <th style={{ width: 40 }}>Max Lose</th>
              <th style={{ width: 40 }}>Max Win</th>
            </thead>
            <tbody>
              {/* {

                totalRatesData.map(t => {
                  return <tr><td>{t.index}</td>
                    <td>{t.sma2}</td>
                    <td>{t.rate}</td>
                    <td>{t.trate}</td>
                    <td>{t.maxLose}</td>
                    <td>{t.maxWin}</td>
                  </tr>
                })
              }
              <tr><td colSpan={10}>{JSON.stringify(totalPRatesData)}</td></tr> */}
              {
                // <tr><td colSpan={10}>{JSON.stringify(totalRatesDataArray.slice(-10))}</td></tr>
              }

            </tbody>
          </table>
        </div>

        <div >

        </div>

        <div style={{ textAlign: 'right' }}>
          <span>LOW: {engineData1P}, HIGH: {engineData2P}, MIDDLE: {engineData3P}, FINAL: {engineDataP} </span>
        </div>
        3X BC CHART
        <canvas id="engineChartTest3X" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
        FINAL 3X CHART
        <canvas id="engineChartFinal" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
        <div style={{ fontSize: 14, backgroundColor: '#ffffdd', marginTop: 10 }}>
          <table>
            <thead>
              <th style={{ width: 40 }}>Counts</th>
              <th style={{ width: 40 }}>1X</th>
              <th style={{ width: 40 }}>2X (49.5%)</th>
              <th style={{ width: 40 }}>3X (33%)</th>
              <th style={{ width: 40 }}>4X (24.75%)</th>
              <th style={{ width: 40 }}>5X (19.8%)</th>
              <th style={{ width: 40 }}>6X (16.5%)</th>
              <th style={{ width: 100 }}>10X (9.9%)</th>
            </thead>
            <tbody>

              {
                [percentCount, 60, 50, 40, 30].map(c => {
                  const data = getPercent(c);
                  if (data == null) return null;
                  return <tr>
                    <td>{c}</td>
                    <td>{data.x1}</td>
                    <td>{data.x2}</td>
                    <td>{data.x3}</td>
                    <td>{data.x4}</td>
                    <td>{data.x5}</td>
                    <td>{data.x6}</td>
                    <td>{data.x10}</td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: '50%' }}>
            2X CHART
            <canvas id="scoreChart" style={{ maxWidth: '100%', width: '100%', display: 'block', height: 300 }}></canvas>
          </div>
          <div style={{ width: '50%' }}>
            3X CHART
            <canvas id="score3xChart" style={{ maxWidth: '100%', width: '100%', display: 'block', height: 300 }}></canvas>
          </div>
        </div>
        <canvas id="payoutChart" style={{ maxWidth: '100%', width: '100%', display: 'block', height: chartType == 2 ? 300 : 300 }}></canvas>
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: '20%' }}>
            LOW CHART
            <canvas id="engineChartTest1Min" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
          </div>
          <div style={{ width: '20%' }}>
            HIGHT CHART
            <canvas id="engineChartTest2Min" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
          </div>
          <div style={{ width: '20%' }}>
            MIDDLE CHART
            <canvas id="engineChartTest3Min" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
          </div>
          <div style={{ width: '20%' }}>
            BC CHART
            <canvas id="engineChartBCMin" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
          </div>
          <div style={{ width: '20%' }}>
            BRANCH CHART
            <canvas id="engineChartBranchMin" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200 }}></canvas>
          </div>
          <div style={{  width: '20%', display: 'flex', flexDirection: 'row-reverse', borderBottom: "1px solid black" }}>
              {currentTrends && currentTrends.values.map((column, cIndex) => {
                return <div>
                  {
                    column.map((v, vIndex) => {
                      let color = 'red';
                      let borderStyle = '1px solid black';

                      if (v >= 10) {
                        color = 'yellow'
                      } else if (v >= 3) {
                        color = 'lime'
                      } else if (v >= 2) {
                        color = 'green'
                      }

                      if (cIndex == 0 && vIndex == column.length - 1) {
                        borderStyle = '3px solid black';
                      }
                      return <div style={{ width: 15, height: 15, backgroundColor: color, border: borderStyle, borderRadius: 100, margin: '1px' }}></div>
                    })
                  }
                </div>
              })}
            </div>
        </div>

        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: '50%' }}>
            2X BC CHART
            <canvas id="engineChartBC" style={{
              maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200
              , backgroundColor: activatedCharts.includes(4) ? 'powderblue' : 'white'
            }} onClick={() => {
              onClickChart(4);
            }}></canvas>
          </div>
          <div style={{ width: '50%' }}>
            FINAL 2X CHART
            <canvas id="engineChartTest2X" style={{ maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200, backgroundColor: 'blanchedalmond' }}></canvas>
          </div>
        </div>

        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: '50%' }}>
            2X LOW CHART
            <canvas id="engineChartTest3" style={{
              maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200,
              backgroundColor: activatedCharts.includes(3) ? 'powderblue' : 'white'
            }} onClick={() => {
              onClickChart(3);
            }}></canvas>
          </div>
          <div style={{ width: '50%' }}>
            2X MID CHART
            <canvas id="engineChartTest2" style={{
              maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200
              , backgroundColor: activatedCharts.includes(2) ? 'powderblue' : 'white'
            }} onClick={() => {
              onClickChart(2);
            }}></canvas>
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ width: '50%' }}>
            2X HIGH CHART
            <canvas id="engineChartTest1" style={{
              maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200
              , backgroundColor: activatedCharts.includes(1) ? 'powderblue' : 'white'
            }} onClick={() => {
              onClickChart(1);
            }}></canvas>
          </div>
          
          <div style={{ width: '50%' }}>
            BRANCH CHART
            <canvas id="branchChart" style={{
              maxWidth: '100%', width: 200, display: 'block', height: 300, maxHeight: 200
              , backgroundColor: activatedCharts.includes(100 + currentBranch) ? 'powderblue' : 'white'
            }} onClick={() => {
              onClickChart(100 + currentBranch);
            }}></canvas>
          </div>

        </div>

        <div style={{ marginTop: 20, marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <input type='checkbox' value={1} className='mr-10' checked={isBettingEnable ? true : false} onClick={(e) => {
            setEnableBetting(e.target.checked ? 1 : 0);
          }} /> Enable RUN


          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} onClick={(e) => {
            setOpacity(e.target.checked ? 1 : 0);
          }} /> NO


          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} checked={isAutoReset ? true : false} onClick={(e) => {
            setAutoReset(e.target.checked ? 1 : 0);
          }} /> AUTO RESET


          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} checked={isAutoUp ? true : false} onClick={(e) => {
            setAutoUp(e.target.checked ? 1 : 0);
          }} /> AUTO UP

          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} checked={isTrenball2X ? true : false} onClick={(e) => {
            setTrenball2X(e.target.checked ? 1 : 0);
          }} /> TRENBALL 2X


          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} checked={isTrenball1X ? true : false} onClick={(e) => {
            setTrenball1X(e.target.checked ? 1 : 0);
          }} /> TRENBALL 1X

          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} onClick={(e) => {
            setMartingale(e.target.checked ? 1 : 0);
          }} /> MARTINGALE


          <input type='checkbox' value={1} style={{ marginLeft: 10, marginRight: 10 }} onClick={(e) => {
            setOnlyAfterRed(e.target.checked ? 1 : 0);
          }} /> ONLY AFTER RED

        </div>
        <div>
        <input type='button' className='mr-10' style={{ marginLeft: 10, marginRight: 10 }} value='RESET' onClick={() => {
            resetOptions();
            
          }} />
          <span style={{marginLeft: 5, marginRight: 10 }}>
          INI BET:
          <input type='number' value={initialBet} style={{ width: 60, marginRight: 3}} onChange={(e) => {
            setInitialBet(parseFloat(e.target.value));
          }} placeholder='Ini Bet' />
          <button style={{padding: '4px 8px', marginRight: 3}} onClick={() => {
            setInitialBet(initialBet * 2);
            resetOptions({
              initialBet: initialBet * 2
            })
          }}>+</button ><button style={{padding: '4px 8px'}} onClick={() => {
            setInitialBet(initialBet / 2);
            resetOptions({
              initialBet: initialBet / 2
            })
          }}>-</button>
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          MAX AMOUNT:
          <input type='number' value={maxAmount} style={{ width: 60, marginRight: 3 }} onChange={(e) => {
            setMaxAmount(parseFloat(e.target.value));
          }} placeholder='Max Amount' />
          <button style={{padding: '4px 8px', marginRight: 3}} onClick={() => {
            setMaxAmount(maxAmount * 2);
            resetOptions({
              maxAmount: maxAmount * 2
            })
          }}>+</button ><button style={{padding: '4px 8px'}} onClick={() => {
            setMaxAmount(maxAmount / 2);
            resetOptions({
              maxAmount: maxAmount / 2
            })
          }}>-</button>
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          CURRENT AMOUNT:
          <input type='number' value={currentBet2X} style={{ width: 60, marginRight: 3 }} onChange={(e) => {
            setCurrentBet2X(parseFloat(e.target.value));
          }} placeholder='Max Amount' />
          <button style={{padding: '4px 8px', marginRight: 3}} onClick={() => {
            setCurrentBet2X(currentBet2X * 2);
            resetOptions({
              currentBet2X: currentBet2X * 2
            })
          }}>+</button ><button style={{padding: '4px 8px'}} onClick={() => {
            setCurrentBet2X(currentBet2X / 2);
            resetOptions({
              currentBet2X: currentBet2X / 2
            })
          }}>-</button>
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          MARTINGALE COUNT:
          <input type='number' value={martingaleCount} style={{ width: 60 }} onChange={(e) => {
            setMartingaleCount(parseFloat(e.target.value));
          }} placeholder='Martingale Count' />
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          DEPOSIT:
          <input type='number' value={deposit} style={{ width: 60 }} onChange={(e) => {
            setDeposit(parseFloat(e.target.value));
          }} placeholder='Martingale Count' />
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          INI PAYOUT:
          <input type='number' value={initialPayout} style={{ width: 60 }} onChange={(e) => {
            setInitialPayout(parseFloat(e.target.value));
          }} placeholder='Ini Payout' />
          </span>
          <span style={{marginLeft: 5, marginRight: 10 }}>
          MAIN BRANCH:
          <input type='number' value={mainBranch} style={{ width: 60, marginRight: 10 }} onChange={(e) => {
            setMainBranch(parseInt(e.target.value));
          }} placeholder='Main Branch' />
          </span>
          <span>3: {bettingTypeWith3.bettingType}X - ({bettingTypeWith3.x2Count} : {bettingTypeWith3.x1Count})</span>

          <span>&nbsp;&nbsp;&nbsp;2: {bettingTypeWith2.bettingType}X - ({bettingTypeWith2.x2Count} : {bettingTypeWith2.x1Count})</span>
        </div>

        <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap', marginTop: 10 }}>
          {
            predictRatesCanvas.map((p, index) => {
              let backgroundColor = 'white';

              let sma2 = 0, sma3 = 0, sma4 = 0, labelName = '';
              let labelColor = null;
              if (predictRatesDataMap) {
                if (predictRatesDataMap[index] && (predictRatesDataMap[index].win3)) {
                  backgroundColor = 'cornsilk'
                } else if (predictRatesDataMap[index] && (predictRatesDataMap[index].win2)) {
                  backgroundColor = 'darkgrey'
                }
                if (predictRatesDataMap[index] && predictRatesDataMap[index].index == currentBranch) {
                  backgroundColor = 'bisque'
                }
                // if (predictRatesDataMap[index]) {
                //   console.log('wwwwwwwwwwwwwww', predictRatesDataMap[index].data10);
                // }
                
                
                
                // console.log("@@@@@@@@@@@@@@@@@@", predictRatesDataMap[index].data);
                if (predictRatesDataMap[index] == undefined) return null;

                if (predictRatesDataMap[index] && predictRatesDataMap[index].data[0].type == 'all') {
                  backgroundColor = 'lightblue';
                }

                if (predictRatesDataMap[index] && predictRatesDataMap[index].data[0].type == 'bc') {
                  backgroundColor = 'gainsboro';
                }

                
                if (predictRatesDataMap[index]) {

                  sma2 = (predictRatesDataMap[index].yDataSMA10 && predictRatesDataMap[index].yDataSMA10[0]) ? predictRatesDataMap[index].yDataSMA10[0][predictRatesDataMap[index].yDataSMA10[0].length - 1].toFixed(2) : 0
                  sma3 = (predictRatesDataMap[index].yDataSMA10 && predictRatesDataMap[index].yDataSMA10[1]) ? predictRatesDataMap[index].yDataSMA10[1][predictRatesDataMap[index].yDataSMA10[1].length - 1].toFixed(2) : 0
                  sma4 = (predictRatesDataMap[index].yDataSMA10 && predictRatesDataMap[index].yDataSMA10[2]) ? predictRatesDataMap[index].yDataSMA10[2][predictRatesDataMap[index].yDataSMA10[2].length - 1].toFixed(2) : 0
                  if (predictRatesDataMap[index].data[0].color != undefined) {
                    labelColor = predictRatesDataMap[index].data[0].color;
                  }

                  labelName = `LINE(${predictRatesDataMap[index].index})`
                }
              }
              return <div style={{ maxWidth: '16%', backgroundColor: backgroundColor, border: '1px solid grey', margin: 5 }}>

                <div style={{ padding: 10 }}>
                  {
                  labelColor != null ? <div style={{width: '100%', height: 20, backgroundColor: labelColor, color: 'white', fontWeight: 'bold'}}>{predictRatesDataMap[index].type.toUpperCase()} </div>
                    : null
                  }
                  
                  <span style={{ fontWeight: 'bold' }}>{labelName}</span>, <span style={{ fontWeight: 'bold' }}>SMA2: </span>{sma2}, <span style={{ fontWeight: 'bold' }}>SMA3: </span>{sma3}, <span style={{ fontWeight: 'bold' }}>SMA4: </span>{sma4}
                </div>
                <canvas id={`predicts_${index}_10`} style={{ maxWidth: '100%', width: '100%', display: 'block', height: 250, maxHeight: 250, marginLeft: 10 }} onClick={(e) => {

                  if (predictRatesDataMap && predictRatesDataMap[index]) {
                    onClickBranch(predictRatesDataMap[index].index);
                  }
                }}></canvas>
                <canvas id={`predicts_${index}`} style={{ maxWidth: '100%', width: '100%', display: 'block', height: 250, maxHeight: 250, marginLeft: 10 }} onClick={(e) => {

                  if (predictRatesDataMap && predictRatesDataMap[index]) {
                    onClickBranch(predictRatesDataMap[index].index);

                  }
                }}></canvas>

              </div>

            })
          }
        </div>
        <div>BC ENGINE CHART</div>
        <div style={{ display: 'flex', width: '100%' }}>
          <canvas id="engineChartGood" style={{ maxWidth: '33%', width: '100%', display: 'block', maxHeight: 200 }}></canvas>
          <canvas id="engineChartBad" style={{ maxWidth: '33%', width: '100%', display: 'block', maxHeight: 200 }}></canvas>
          <canvas id="engineChartMid" style={{ maxWidth: '33%', width: '100%', display: 'block', maxHeight: 200 }}></canvas>
        </div>
        {/* <div>FINAL CHART</div>
        
        <div>MIDDLE CHART</div> */}





        
        <div style={{ display: 'flex', alignItems: 'center', padding: 20 }}>
          <span style={{ fontSize: 14, backgroundColor: '#ffffee' }}>
            <div style={{ marginTop: 20 }}>Short  Direction: {directions[0]}</div>
            <div style={{ marginTop: 20 }}>Middle Direction: {directions[1]}</div>
            <div style={{ marginTop: 20 }}>Long   Direction: {directions[2]}</div>
          </span>


          <span>
            
          </span>
        </div>

        {
          currentBetting ? <div className='column' style={{ fontSize: 14 }}>
            <table style={{ textAlign: 'left' }}>
              <tr>
                <td>Prev Profit</td>
                <td>{currentBetting.loseOf2Deep}</td>
              </tr>
              <tr>
                <td>Total Profit</td>
                <td>{currentBetting.totalLoseOf3Deep}</td>
              </tr>
              <tr>
                <td>Pattern With Limit</td>
                <td>{currentBetting.scoreOfPatternWithLimit} % / {currentBetting.x3OfPatternWithLimit}% - {currentBetting.bettingCountOfWithLimit}</td>
              </tr>
              <tr>
                <td>Pattern No Limit</td>
                <td>{currentBetting.scoreOfPatternNoLimit} % / {currentBetting.x3OfPatternNoLimit}% - {currentBetting.bettingCountOfNoLimit}</td>
              </tr>
              <tr>
                <td>Pattern With Lose</td>
                <td>{currentBetting.scoreOfPatternWithLose} % / {currentBetting.x3OfPatternWithLose}% - {currentBetting.bettingCountOfLose}</td>
              </tr>
              <tr>
                <td>X3 Rate</td>
                <td>{currentBetting.win3XRate} % - {currentBetting.total3DeepWinCount}</td>
              </tr>
              <tr>
                <td>Score</td>
                <td style={{ color: 'red' }}>{currentBetting.score} / {currentBetting.nextScore}</td>
              </tr>
              <tr>
                <td>Trenball</td>
                <td>LOW: {currentBetting.trenballLowBet}, HIGH: {currentBetting.trenballHighBet}, MOON: {currentBetting.trenballMoonBet}</td>
              </tr>
              <tr>
                <td>AI Score</td>
                <td>{currentBetting.aiScore} - {getExpectedPayout(currentBetting.aiScore)}X / {currentBetting.aiScore2} - {getExpectedPayout(currentBetting.aiScore2)}X</td>
              </tr>
              <tr>
                <td>AI Score3</td>
                <td>{currentBetting.aiScore3x} - {getExpectedPayout(currentBetting.aiScore3x)}X</td>
              </tr>
              <tr>
                <td>Strategy</td>
                <td>{currentBetting.strategy}</td>
              </tr>
            </table>
          </div>
            : null
        }


        <div style={{ display: 'flex' }}>
          <div className='column'>

            <h1 className="title">Moon Data {moonDataFilter.length} /
              (TotalBetting: {totalBet},
              WinCount: {totalWin},
              LoseCount: {totalLose},
              Win2XCount: {total2XWin},

              )
            </h1>
            <div style={{ fontSize: 14 }}>
              Pattern: <input type='input' ref={filterElMoonPatternRef} style={{ width: 120 }} />
              &nbsp;&nbsp;Score: <input type='input' ref={filterElMoonScoreRef} style={{ width: 60 }} />
              &nbsp;&nbsp;Sum02 Min: <input type='input' ref={filterElMoonMinRef2} style={{ width: 100 }} />
              &nbsp;&nbsp;Sum02 Max: <input type='input' ref={filterElMoonMaxRef2} style={{ width: 100 }} />
              &nbsp;&nbsp;Sum03 Min: <input type='input' ref={filterElMoonMinRef3} style={{ width: 100 }} />
              &nbsp;&nbsp;Sum03 Max: <input type='input' ref={filterElMoonMaxRef} style={{ width: 100 }} />
            </div>
            <div style={{ marginTop: 10 }}>
              Sum04 Min: <input type='input' ref={filterElMoonMinRef4} style={{ width: 100 }} />
              &nbsp;&nbsp;Sum04 Max: <input type='input' ref={filterElMoonMaxRef4} style={{ width: 100 }} />
            </div>
            <div style={{ fontSize: 14, marginTop: 10 }}>
              <button style={{ backgroundColor: filterTypeOfMoon == 'green' ? 'yellow' : 'transparent' }} onClick={(e) => {
                filterData(true, 1, filterElMoonPatternRef.current.value.trim(), filterElMoonScoreRef.current.value.trim()
                  , filterElMoonMinRef3.current.value.trim(), filterElMoonMaxRef.current.value.trim()
                  , filterElMoonMinRef2.current.value.trim(), filterElMoonMaxRef2.current.value.trim()
                  , filterElMoonMinRef4.current.value.trim(), filterElMoonMaxRef4.current.value.trim()
                );
                setFilterTypeOfMoon('green')
              }}>Green Filter</button>
              <button style={{ marginLeft: 20, backgroundColor: filterTypeOfMoon == 'red' ? 'yellow' : 'transparent' }} onClick={(e) => {
                filterData(true, 0, filterElMoonPatternRef.current.value.trim(), filterElMoonScoreRef.current.value.trim()
                  , filterElMoonMinRef3.current.value.trim(), filterElMoonMaxRef.current.value.trim()
                  , filterElMoonMinRef2.current.value.trim(), filterElMoonMaxRef2.current.value.trim()
                  , filterElMoonMinRef4.current.value.trim(), filterElMoonMaxRef4.current.value.trim()
                );
                setFilterTypeOfMoon('red')
              }}>Red Filter</button>
              <button style={{ marginLeft: 20 }} onClick={(e) => {
                filterData(true, 0, "");
                setFilterTypeOfMoon('none')
              }}>Cancel Filter</button>
            </div>
            <div className='column' style={{ marginTop: 30, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', fontSize: 14 }}>
              {
                // [...moonDataFilter].reverse().sort((a, b) => {

                //   if (a.status > b.status)
                //     return -1;
                //   else if (a.status < b.status) {
                //     return 1
                //   }
                //   return 0;
                // })
                // .sort((a, b) => {
                //   if (a.payouts.length == 0 && b.payouts.length == 0) return 0;
                //   if (a.payouts.length > b.payouts.length)
                //     return -1;
                //   return 1;
                // })
                [...moonDataFilter].map((moon, index) => {
                  return;
                  // if (index >= 5) return null;
                  let winCount = 0;
                  // let vDeeps = moon.values.map(column => {
                  //   return column.length
                  // });

                  // if (vDeeps[0] == 1) {
                  //   vDeeps.shift();
                  // } else {
                  //   vDeeps[0] = vDeeps[0] - 1;
                  // }

                  let vDeeps = [0]
                  console.log("MOON", moon);
                  moon.payouts = [];
                  moon.profits = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
                  moon.pattern = [];

                  // moon.payouts.map((p) => {
                  //   if (p >= 2) {
                  //     winCount++;
                  //   }
                  // })
                  return <PatternComponent socket={socket} dataItem={moon} winCount={winCount} vDeeps={vDeeps} moonOrKill={true} onClickPayouts={(hash) => {
                    onClickPayouts(hash);
                  }} />
                })
              }
            </div>
          </div>
          {/* <div className='column'>
            <h1 className="title">Kill Data ({killDataFilter.length})</h1>
            <div style={{ fontSize: 14 }}>
              Pattern: <input type='input' ref={filterElKillPatternRef} style={{ width: 120 }} />
              &nbsp;&nbsp;Score: <input type='input' ref={filterElKillScoreRef} style={{ width: 60 }} />
              &nbsp;&nbsp;Profit: <input type='input' ref={filterElKillProfitRef} style={{ width: 100 }} />
            </div>

            <div style={{ fontSize: 14, marginTop: 10 }}>
              <button style={{ backgroundColor: filterTypeOfKill == 'green' ? 'yellow' : 'transparent' }} onClick={(e) => {
                setFilterTypeOfKill('green')
                filterData(false, 0, filterElKillPatternRef.current.value.trim(), filterElKillScoreRef.current.value.trim(), filterElKillProfitRef.current.value.trim());

              }}>Green Filter</button>
              <button style={{ marginLeft: 20, backgroundColor: filterTypeOfKill == 'red' ? 'yellow' : 'transparent' }} onClick={(e) => {
                filterData(false, 1, filterElKillPatternRef.current.value.trim(), filterElKillScoreRef.current.value.trim(), filterElKillProfitRef.current.value.trim());
                setFilterTypeOfKill('red')
              }}>Red Filter</button>
              <button style={{ marginLeft: 20 }} onClick={(e) => {
                filterData(false, 0, "");
                setFilterTypeOfKill('none')
              }}>Cancel Filter</button>
            </div>
            <div className='column' style={{ marginTop: 30, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', fontSize: 14 }}>
              {
                [...killDataFilter].reverse().sort((a, b) => {
                  if (a.payouts.length == 0 && b.payouts.length == 0) return 0;
                  if (a.payouts.length > b.payouts.length)
                    return -1;
                  return 1;
                }).map((moon) => {
                  let winCount = 0;
                  let vDeeps = moon.values.map(column => {
                    return column.length
                  });

                  if (vDeeps[0] == 1) {
                    vDeeps.shift();
                  } else {
                    vDeeps[0] = vDeeps[0] - 1;
                  }

                  moon.payouts.map((p) => {
                    if (p >= 2) {
                      winCount++;
                    }
                  })
                  return <PatternComponent socket={socket} dataItem={moon} winCount={winCount} vDeeps={vDeeps} moonOrKill={false} />
                })
              }
            </div>
          </div> */}
        </div>


      </div>
    </div >
  );
};


export default HomePage;
