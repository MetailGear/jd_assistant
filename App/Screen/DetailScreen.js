import React from 'react';
import {Text, View, Image, Linking, Button, ScrollView} from "react-native"
import {LineChart} from "react-native-chart-kit";
import jd from "../Service/JD"
import GlobalStyle from '../Style'

import {Ticket} from "./Widget"

const styles = {
  ...GlobalStyle,
}
styles.titleRow = {
  flexDirection: 'row',
  alignItems: 'center'
}

styles.name = {
  fontSize: 24,
  lineHeight: 30,
}
styles.title1 = {
  fontSize: 26,
  lineHeight: 50,
}
styles.titleProm = {
  ...styles.title1,
  color: 'green',
}
styles.promotionText = {
  fontSize: 18,
  lineHeight: 24,
  color: 'red'
}
styles.moneyOffText = {
  fontSize: 18,
  lineHeight: 24,
  color: 'blue'
}

const getPlusDay = (date, plus) => {
  if (!plus) plus = 1
  return new Date(date.getTime() + (plus * (24 * 60 * 60 * 1000)))
}

const linkToJDApp = (pid) => {
  const url = `openapp.jdmobile://virtual?params={"des":"productDetail","skuId":"${pid}","category":"jump"}`
  Linking.canOpenURL(url).then(() => {
    Linking.openURL(url)
  }).catch(() => {
    alert('未找到京东App')
  })
}

export default class DetailsScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      product: null,
      history: null,
      labels: null,
      priceSets: null,
      promSets: null,
    }
  }

  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "详情",
    headerRight: () => <Button title="Link" onPress={()=>{ linkToJDApp(navigation.getParam('id')) }} />,
  })

  componentDidMount(): void {
    const productId = this.props.navigation.getParam('id')
    const product = jd.getProduct(productId)
    this.setState({product})
    this.getHistory()
    console.log(product)
  }

  getHistory = () => {
    const productId = this.props.navigation.getParam('id')
    jd.loadHistory(productId).then(history => {
      this.setHistoryData(history)
    })
  }

  setHistoryData = (history) => {
    if (!history || history.length < 2) return
    let startLabel = history[0].date
    let endLabel = history[history.length - 1].date
    const labels = [startLabel]
    const priceSets = [history[0].price]
    const promSets = [history[0].prom]

    let date = new Date(`2020.${startLabel}`)
    let labelTemp = null
    while (labelTemp !== endLabel && labels.length < 180) {
      date = getPlusDay(date)
      labelTemp = (date.getMonth() + 1) + '.' + date.getDay()
      labels.push(labelTemp)
      let targetHistory
      if ((targetHistory = history.find(h => h.date === labelTemp))) {
        priceSets.push(targetHistory.price)
        promSets.push(targetHistory.prom)
      } else {
        priceSets.push(priceSets[priceSets.length - 1])
        promSets.push(promSets[promSets.length - 1])
      }
    }
    this.setState({history, labels, priceSets, promSets})
  }

  render() {
    const {product, history, labels, priceSets, promSets} = this.state
    if (!product) return <View/>
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.titleRow}>
          <Image source={{uri: product.imgUrl}} style={{width: 120, height: 120}}/>
          <View style={{paddingHorizontal: 10, flex: 1}}>
            <Text style={styles.name}>{product.name}</Text>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <Text style={product.p_price ? styles.titleProm : styles.title1}>
            ¥{product.p_price || product.price}
          </Text>
          {product.p_price &&
            <Text style={styles.title1}>（¥{product.price}）</Text>
          }
        </View>

        <ScrollView>

          <View style={{marginBottom: 15}}>
            <View>
              {product.promotions && product.promotions.map(({content}, index) => (
                <Text style={styles.promotionText} key={index}>{content}</Text>
              ))}
            </View>
            <View>
              {product.moneyOffs && product.moneyOffs.map(({ratePrice, supply, isCount}, index) => {
                let supplyText = isCount ? `${supply}件` : `¥${supply}`
                return (
                  <Text style={styles.moneyOffText} key={index}>
                    凑{supplyText}，单价约：¥{ratePrice}
                  </Text>
                )
              })}
            </View>
          </View>

          <View style={{marginBottom: 15}}>
            <View style={{flexDirection: 'row'}}>
              {product.tickets && product.tickets.map(({text}, index) => (
                <View style={{marginRight: 5,}} key={index}>
                  <Ticket text={text} size={16}/>
                </View>
              ))}
            </View>
            <View>
              {product.tickets && product.tickets.map(({ratePrice, supply}, index) => (
                <Text style={styles.moneyOffText} key={index}>
                  凑{supply}，单价约：¥{ratePrice}
                </Text>
              ))}
            </View>
          </View>

          {product.combos &&
            <View style={{marginBottom: 15}}>
              <View>
                <Text style={styles.promotionText}>组合：</Text>
              </View>
              <View>
                {product.combos && product.combos.map(({ratePrice, supply}, index) => (
                  <Text style={styles.moneyOffText} key={index}>
                    凑{supply}，单价约：¥{ratePrice}
                  </Text>
                ))}
              </View>
            </View>
          }
        </ScrollView>
        <View>
          {history && history.length > 1 &&
            <LineChart
              data={{
                labels,
                datasets: [
                  { data: priceSets },
                  { data: promSets }
                ]
              }}
              width={styles.screen.width + 46} // from react-native
              height={220}
              yAxisLabel="¥"
              yAxisInterval={1} // optional, defaults to 1
              yLabelsOffset={-50}
              xLabelsOffset={-6}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 1, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                },
                strokeWidth: 0.5,
                propsForDots: {
                  r: "1",
                }
              }}
              style={{
                marginVertical: 8,
                marginLeft: -54,
                marginBottom: -10,
              }}
            />
          }
        </View>

      </View>
    );
  }
}
