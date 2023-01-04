import React, {Component} from 'react';
import ajax from '../ajax';

import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import DealList from './DealList';
import DealDetail from './DealDetail';
import SearchBar from './SearchBar';

class App extends Component {
  titleXPos = new Animated.Value(0);
  state = {
    deals: [],
    dealsFromSearch: [],
    currentDealId: null,
    activeSearchTerm: '',
  };
  animateTitle = (opacity = 1) => {
    Animated.timing(this.titleXPos, {
      toValue: opacity,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        this.animateTitle(opacity === 1 ? 0 : 1);
      }
    });
  };
  async componentDidMount() {
    this.animateTitle();
    const deals = await ajax.fetchInitialDeals();
    this.setState({deals: deals});
  }

  searchDeals = async searchTerm => {
    let dealsFromSearch = [];
    if (searchTerm) {
      dealsFromSearch = await ajax.fetchDealsSearchResults(searchTerm);
    }
    this.setState({dealsFromSearch, activeSearchTerm: searchTerm});
  };

  setCurrentView = dealId => {
    this.setState({currentDealId: dealId});
  };

  unsetCurrentView = () => {
    this.setState({currentDealId: null});
  };

  currentDeal = () => {
    return this.state.deals.find(deal => deal.key === this.state.currentDealId);
  };

  handleDealSwipe = indexDirection => {
    const nextDealIndex =
      this.state.deals.indexOf(
        this.state.deals.find(deal => deal.key === this.state.currentDealId),
      ) + indexDirection;
    if (nextDealIndex < 0 || nextDealIndex > this.state.deals.length - 1) {
      return false;
    }
    this.setState(prevState => ({
      currentDealId: prevState.deals[nextDealIndex].key,
    }));
    return true;
  };

  render() {
    if (this.state.currentDealId) {
      return (
        <View style={styles.main}>
          <DealDetail
            initialDealData={this.currentDeal()}
            onBack={this.unsetCurrentView}
            onSwipeDeal={this.handleDealSwipe}
          />
        </View>
      );
    }
    const dealsToDisplay =
      this.state.dealsFromSearch.length > 0
        ? this.state.dealsFromSearch
        : this.state.deals;
    if (dealsToDisplay.length > 0) {
      return (
        <View style={styles.main}>
          <SearchBar
            searchDeals={this.searchDeals}
            initialSearchTerm={this.state.activeSearchTerm}
          />
          <DealList deals={dealsToDisplay} onItemPress={this.setCurrentView} />
        </View>
      );
    }
    return (
      <Animated.View style={[{opacity: this.titleXPos}, styles.container]}>
        <Text style={styles.header}>Bakesale</Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    marginTop: 50,
  },
  header: {
    fontSize: 40,
  },
});

export default App;
