import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Button,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
} from 'react-native';

import {priceDisplay} from '../util';
import ajax from '../ajax';

class DealDetail extends Component {
  imageXPos = new Animated.Value(0);
  dealXPos = new Animated.Value(0);
  screenWidth = Dimensions.get('window').width;

  imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      this.imageXPos.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > this.screenWidth * 0.4) {
        const direction = Math.sign(gestureState.dx);
        // direction: -1 for left, 1 for right
        Animated.timing(this.imageXPos, {
          toValue: direction * this.screenWidth,
          duration: 250,
          useNativeDriver: false,
        }).start(() => this.handleImageSwipe(-1 * direction));
      } else {
        Animated.spring(this.imageXPos, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  dealPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      this.dealXPos.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > this.screenWidth * 0.4) {
        const direction = Math.sign(gestureState.dx);
        // direction: -1 for left, 1 for right
        Animated.timing(this.dealXPos, {
          toValue: direction * this.screenWidth,
          duration: 250,
          useNativeDriver: false,
        }).start(() => this.handleDealSwipe(-1 * direction));
      } else {
        Animated.spring(this.dealXPos, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  handleImageSwipe = indexDirection => {
    if (!this.state.deal.media[this.state.imageIndex + indexDirection]) {
      Animated.spring(this.imageXPos, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      return;
    }
    this.setState(
      prevState => ({
        imageIndex: prevState.imageIndex + indexDirection,
      }),
      () => {
        // Next image animation
        this.imageXPos.setValue(indexDirection * this.screenWidth);
        Animated.spring(this.imageXPos, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    );
  };

  handleDealSwipe = async indexDirection => {
    const checkDeal = await this.props.onSwipeDeal(indexDirection);
    if (!checkDeal) {
      Animated.spring(this.dealXPos, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      return;
    }
    const fullDeal = await ajax.fetchDealDetail(this.props.initialDealData.key);
    this.setState({deal: fullDeal, imageIndex: 0});
    await this.dealXPos.setValue(indexDirection * this.screenWidth);
    await Animated.spring(this.dealXPos, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  static propTypes = {
    initialDealData: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
    onSwipeDeal: PropTypes.func.isRequired,
  };
  state = {
    deal: this.props.initialDealData,
    imageIndex: 0,
  };
  async componentDidMount() {
    const fullDeal = await ajax.fetchDealDetail(this.state.deal.key);
    this.setState({deal: fullDeal});
  }

  openDealURL = () => {
    Linking.openURL(this.state.deal.url);
  };

  render() {
    const {deal} = this.state;
    return (
      <ScrollView>
        <Animated.View
          {...this.dealPanResponder.panHandlers}
          style={[{left: this.dealXPos}, styles.deal]}>
          <TouchableOpacity onPress={this.props.onBack}>
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
          <Animated.Image
            {...this.imagePanResponder.panHandlers}
            source={{uri: deal.media[this.state.imageIndex]}}
            style={[{left: this.imageXPos}, styles.image]}
          />
          <View style={styles.detail}>
            <View>
              <Text style={styles.title}>{deal.title}</Text>
            </View>
            <View style={styles.footer}>
              <View style={styles.info}>
                <Text style={styles.cause}>{priceDisplay(deal.price)}</Text>
                <Text style={styles.price}>{deal.cause.name}</Text>
              </View>
              {deal.user && (
                <View>
                  <Image
                    source={{uri: deal.user.avatar}}
                    style={styles.avatar}
                  />
                  <Text>{deal.user.name}</Text>
                </View>
              )}
            </View>
            <View>
              <Text>{deal.description}</Text>
            </View>
            <Button title="Buy this deal!" onPress={this.openDealURL} />
          </View>
        </Animated.View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  deal: {
    marginHorizontal: 12,
    marginBottom: 20,
  },
  backLink: {
    marginBottom: 5,
    color: '#22f',
    marginLeft: 10,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
  },
  info: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(237, 149, 45, 0.4)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  cause: {
    flex: 2,
  },
  price: {
    flex: 1,
    textAlign: 'right',
  },
  avatar: {
    width: 60,
    height: 60,
  },
});

export default DealDetail;
