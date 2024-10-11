import React, { useState, useReducer, useRef, useEffect } from 'react';
import { css } from '@emotion/react';

const PatternComponentStyle = css`
	
`;

const PatternComponent = ({
	socket,
	dataItem,
	vDeeps,
	moonOrKill,
	onClickPayouts
}) => {

	const [updated, setUpdated] = useState(false)
	const [sum0, setSum0] = useState(false)
	const [sum1, setSum1] = useState(false)
	const [nextMoon, setNextMoon] = useState(null)

	useEffect(() => {
		const sum0 = dataItem.profits.map((p, index) => {
			if (index > 3) return 0;
			return p.reduce((accumulator, currentValue) => {
				return accumulator + currentValue
			}, 0)
		}).reduce((accumulator, currentValue) => {
			return accumulator + currentValue
		}, 0);

		let sum10 = 0;
		const profitHistory = dataItem.profits.flat().reverse().map((v, index) => {
			sum10 = sum10 + v;
			return sum10;
		});

		setSum0(sum0);
		dataItem.sum0 = sum0;
		dataItem.sum10 = sum10;
		let sum1 = 0;
		if (dataItem.profits[0].length == 1) {
			sum1 = dataItem.profits.map((p, index) => {
				if (index > 3) return 0;
				return p.reduce((accumulator, currentValue) => {
					return accumulator + currentValue
				}, 0)
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue
			}, 0);
		} else {
			sum1 = dataItem.profits.map((p, index) => {
				if (index > 2) return 0;
				return p.reduce((accumulator, currentValue) => {
					return accumulator + currentValue
				}, 0)
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue
			}, 0);
		}

		sum1 = sum1 - dataItem.profits[0][dataItem.profits[0].length - 1];
		dataItem.lastScore = dataItem.profits[0][dataItem.profits[0].length - 1];
		dataItem.sum1 = sum1;
		dataItem.profitHistory = profitHistory;
		dataItem.prevProfit = dataItem.profits.flat().slice(1, 2)[0];


		let sum4 = 0;
		if (dataItem.profits[0].length == 1) {
			sum4 = dataItem.profits.map((p, index) => {
				if (index > 5) return 0;
				return p.reduce((accumulator, currentValue) => {
					return accumulator + currentValue
				}, 0)
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue
			}, 0);
		} else {
			sum4 = dataItem.profits.map((p, index) => {
				if (index > 4) return 0;
				return p.reduce((accumulator, currentValue) => {
					return accumulator + currentValue
				}, 0)
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue
			}, 0);
		}

		sum4 = sum4 - dataItem.profits[0][dataItem.profits[0].length - 1];
		dataItem.sum4 = sum4;

		const profits = JSON.parse(JSON.stringify(dataItem.profits));
		if (profits[0].length == 1) {
			profits.shift();
		} else {
			profits[0].pop();
		}

		// console.log('PROFITS============', profits);
		const sum02 = profits.length >= 3 && profits[1] && profits[1].reduce((accumulator, currentValue) => {
			return accumulator + currentValue
		}, 0);

		// console.log('SUMMMMMMMMMMMMMMMMM', sum02);

		dataItem.sum02 = sum02
		dataItem.sum02_count = profits[1] && profits[1].length;

		


		setSum1(sum1);



	})

	const exportData = () => {

		if (confirm('Payout data might be clear')) {
			socket.send(JSON.stringify({
				command: moonOrKill ? 'exportmoon' : 'exportkill',
			}))
		}

	}

	return <div key={dataItem._id} style={{ border: "1px solid black", margin: "20px 10px", backgroundColor: dataItem.payouts.length > 0 ? 'navajowhite' : 'transparent' }} onClick={(e) => {
		setNextMoon(null)
	}}>
		<div style={{ display: 'flex', flexDirection: 'row-reverse', borderBottom: "1px solid black" }} onClick={() => onClickPayouts(dataItem.hash)}>
			{
				dataItem.values.map((column, cIndex) => {
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
				})
			}
		</div>
		<div style={{ margin: "5px 10px" }}>
			<div style={{ margin: "5px 0px" }}>
				Score: {dataItem.score}
			</div>
			<div style={{ margin: "5px 0px" }}>
				<div>{dataItem.trendStatus == 0 ? "GOOD" : dataItem.trendStatus == 1 ? "BAD" : "MIDDLE"}</div>
				<div>{dataItem.predicts.slice(0, 3).join(',')}</div>
				<div>{dataItem.predicts.slice(3, 6).join(',')}</div>
				<div>{dataItem.predicts.slice(6, 9).join(',')}</div>
			</div>
			<div style={{ margin: "5px 0px" }}>
				Deeps: <div>"{vDeeps.join(",")
					// dataItem.values.map(column => {
					//   return column.length
					// }).join(',')
				}"</div>

			</div>
			<div style={{ margin: "5px 0px" }}>

				Current Profit: {
					(dataItem.profits[0] && dataItem.profits[0].reduce((accumulator, currentValue) => {
						return accumulator + currentValue
					}, 0)) + (dataItem.profits[1] && dataItem.profits[1].reduce((accumulator, currentValue) => {
						return accumulator + currentValue
					}, 0))
				}
			</div>
			{/* <div style={{ margin: "5px 0px" }}>
				SUM 0: {sum0}
			</div> */}
			<div style={{ margin: "5px 0px" }}>
				SUM 2: {dataItem.sum02} ({dataItem.sum02_count})
			</div>
			<div style={{ margin: "5px 0px" }}>
				SUM 3: {sum1}
			</div>
			<div style={{ margin: "5px 0px" }}>
				SUM 4: {dataItem.sum4}
			</div>
			<div style={{ margin: "5px 0px" }}>
				CREATED: {dataItem.created}
			</div>
			{/* <div style={{ margin: "5px 0px" }}>
				NEXT SCORE: {dataItem.nextScore && dataItem.nextScore.join(',')}
			</div> */}
			<div style={{ margin: "5px 0px" }}>
				NEXT SCORE: {dataItem.nextMoons && dataItem.nextMoons.map(nm => {
					return <a href="#" style={{color: 'blue'}} onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						setNextMoon(nm);
					}}>{nm.score}&nbsp;&nbsp;</a>
				})}
			</div>



			{/* <div style={{ margin: "5px 0px" }}>
				SUM 10: {dataItem.sum10}
			</div> */}

			<div style={{ margin: "5px 0px" }}>
				SUM HR2: {dataItem.prevProfit}
			</div>


			<div style={{ margin: "5px 0px" }}>
				Status: {dataItem.status == 1 ? <span style={{ color: 'red' }}>Applied</span> : 'Canceled'}
				&nbsp;&nbsp;&nbsp;Type: {<span style={{ width: 15, height: 15, display: 'inline-block', borderRadius: 20, backgroundColor: dataItem.patternType == 1 ? "green" : 'red' }}></span>}
			</div>
			<div style={{ margin: "5px 0px" }}>
				<a href="#" onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					dataItem.displayRate = !dataItem.displayRate;
					setUpdated(!updated);
					console.log('dataItem.displayRate===', dataItem.displayRate)
				}}>Win Rate: </a>{dataItem.payouts.length} / {
					dataItem.payouts.filter(p => p.payout >= 2).length
				}
				{
					dataItem.displayRate && <div>
						{dataItem.payouts.join(", ")}
					</div>
				}
			</div>
			<div style={{ marginTop: 10 }}>
				Pattern: <input defaultValue={dataItem.pattern.join(",")} onChange={(e) => {
					dataItem.pattern = e.target.value.trim().split(",")
				}} />
			</div>
			<div style={{ marginTop: 10 }}>
				<span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 15, backgroundColor: 'green' }}></span> Bet Limit: <input defaultValue={dataItem.greenProfitLimit} onChange={(e) => {
					dataItem.greenProfitLimit = e.target.value.trim()
				}} />
			</div>
			<div style={{ marginTop: 10 }}>
				<span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 15, backgroundColor: 'green' }}></span> Sell Limit: <input defaultValue={dataItem.greenSellLimit} onChange={(e) => {
					dataItem.greenSellLimit = e.target.value.trim()
				}} />
			</div>
			<div style={{ marginTop: 10 }}>
				<span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 15, backgroundColor: 'red' }}></span> Limit: <input defaultValue={dataItem.redLoseLimit} onChange={(e) => {
					dataItem.redLoseLimit = e.target.value.trim()
				}} />
			</div>
			<div style={{ marginTop: 10 }}>
				Deep Limit: <input defaultValue={dataItem.checkDeepLimit} onChange={(e) => {
					dataItem.checkDeepLimit = e.target.value.trim()
				}} />
			</div>

			<div style={{ marginTop: 10 }}>
				<button onClick={() => {
					dataItem.status = 1;
					socket.send(JSON.stringify({
						command: moonOrKill ? 'savemoon' : 'savekill',
						data: dataItem
					}))


					setTimeout(() => {
						socket.send(JSON.stringify({
							command: moonOrKill ? 'moondata' : 'killdata'
						}))
					}, 1000)
				}}>Apply</button>
				<button onClick={() => {
					dataItem.status = 0;
					socket.send(JSON.stringify({
						command: moonOrKill ? 'savemoon' : 'savekill',
						data: dataItem
					}))
					setTimeout(() => {
						socket.send(JSON.stringify({
							command: moonOrKill ? 'moondata' : 'killdata',
							data: dataItem
						}))
					}, 1000)
				}}>Cancel</button>
				<button onClick={() => {
					dataItem.patternType = 1;
					socket.send(JSON.stringify({
						command: moonOrKill ? 'savemoon' : 'savekill',
						data: dataItem
					}))
					setTimeout(() => {
						socket.send(JSON.stringify({
							command: moonOrKill ? 'moondata' : 'killdata',
							data: dataItem
						}))
					}, 1000)
				}}><span style={{ width: 10, height: 10, borderRadius: 15, backgroundColor: 'green', display: 'inline-block' }}></span></button>
				<button onClick={() => {
					dataItem.patternType = 0;
					socket.send(JSON.stringify({
						command: moonOrKill ? 'savemoon' : 'savekill',
						data: dataItem
					}))
					setTimeout(() => {
						socket.send(JSON.stringify({
							command: moonOrKill ? 'moondata' : 'killdata',
							data: dataItem
						}))
					}, 1000)
				}}><span style={{ width: 10, height: 10, borderRadius: 15, backgroundColor: 'red', display: 'inline-block' }}></span></button>
				<button onClick={() => {
					exportData();
				}}>Export</button>
			</div>
			<div style={{ marginTop: 10 }}>
				<button onClick={() => {
					dataItem.payouts = [];
					socket.send(JSON.stringify({
						command: moonOrKill ? 'savemoon' : 'savekill',
						data: dataItem
					}))


					setTimeout(() => {
						socket.send(JSON.stringify({
							command: moonOrKill ? 'moondata' : 'killdata'
						}))
					}, 1000)
				}}>Clear Payouts</button>
			</div>
		</div>
		<div class="nextmoon" style={{position: 'absolute', backgroundColor: 'yellow'}}>
		{
			nextMoon && <PatternComponent moonOrKill={true} dataItem={nextMoon} socket={socket} vDeeps = {[]} />
		}
		</div>
	</div>


}

export default PatternComponent;