import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from "./Config.json"

class Transactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      filteredTransactions: [],
      startDate: '',
      endDate: '',
      searchQuery: '',
      splitPayment: []
    };
  }

  componentDidMount() {
    this.getTransactions();
    this.getSplitPayment();
  }
  
  getTransactions = async () => {
    try {
      const response = await axios.get(`${config.Configuration.database}/transactions`);
      this.setState({ transactions: response.data, filteredTransactions: response.data });
      console.log(this.state.transactions);
    } catch (error) {
      console.error(error);
    }
  };

  getSplitPayment = async () => {
    try {
      const response = await axios.get(`${config.Configuration.database}/splitPayment`);
      this.setState({ splitPayment: response.data });
    } catch(error) {
      console.error(error)
    }
  }

  handleStartDateChange = (event) => {
    const startDate = event.target.value;
    this.setState({ startDate }, () => {
      if (!startDate) {
        this.setState({ filteredTransactions: this.state.transactions });
      } else {
        this.filterTransactions();
      }
    });
  };
  
  handleEndDateChange = (event) => {
    const endDate = event.target.value;
    this.setState({ endDate }, () => {
      if (!endDate) {
        this.setState({ filteredTransactions: this.state.transactions });
      } else {
        this.filterTransactions();
      }
    });
  };

  handleStartDateChange = (event) => {
    const startDate = event.target.value;
    this.setState({ startDate }, () => {
      if (!startDate) {
        this.setState({ filteredTransactions: this.state.transactions });
      } else {
        this.filterTransactions();
      }
    });
  };
  
  handleEndDateChange = (event) => {
    const endDate = event.target.value;
    this.setState({ endDate }, () => {
      if (!endDate) {
        this.setState({ filteredTransactions: this.state.transactions });
      } else {
        this.filterTransactions();
      }
    });
  };

  handleSplitPayment = async (id, balance, customerId, items) => {
    const {splitPayment} = this.state;
    console.log(id, balance, customerId, items)
    console.log(splitPayment)
    if (splitPayment.length > 0) {
      splitPayment.map((split) => {
        if (split.transId == id && split.balance !== 0) {
          console.log("okay")
          localStorage.setItem('transId', JSON.stringify(
            {
            id: id, 
            balance: split.balance, 
            customerId: customerId, 
            items: items
          }));
          console.log("okay")
          window.location.assign("/SplitPayment");
        } else {
          console.log("okay")
          localStorage.setItem('transId', JSON.stringify(
            {
            id: id, 
            balance: balance, 
            customerId: customerId, 
            items: items
          }));
          window.location.assign("/SplitPayment");
        }
      })
    } else {
      localStorage.setItem('transId', JSON.stringify(
        {
        id: id, 
        balance: balance, 
        customerId: customerId, 
        items: items
      }));
      window.location.assign("/SplitPayment");
    }
  }

  filterTransactions = () => {
    const { transactions, startDate, endDate } = this.state;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) {
      start.setHours(0, 0, 0, 0); 
    }
  
    const filteredTransactions = transactions.filter((trans) => {
      const transDate = new Date(trans.transDate);
      if (start && end) {
        return (
          transDate >= start && 
          transDate <= end
        );
      } else {
        return true;
      }
    });
  
    this.setState({ filteredTransactions: filteredTransactions });
  };

  formatDate = (dateString) => {
    const options = { month: '2-digit', day: '2-digit', year: '2-digit' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  };
  
  handleClearDates = () => {
    this.setState({
      startDate: '',
      endDate: '',
      filteredTransactions: this.state.transactions,
    });
  };

  handleSearch = (searchQuery) => {
    this.setState({ searchQuery }, () => {
      const { transactions, searchQuery } = this.state;
      if (searchQuery.trim() === '') {
        this.setState({ filteredTransactions: transactions });
      } else {
        const filtered = transactions.filter(
          (trans) =>
            trans.id.toString() === searchQuery.trim() ||
            trans.fName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            trans.lName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            trans.modeOfPayment.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            `${trans.fName.toLowerCase()} ${trans.lName.toLowerCase()}`.includes(searchQuery.toLowerCase().trim())
        );
        this.setState({ filteredTransactions: filtered });
      }
    });
  };  

  render() {
    const {
      startDate,
      endDate,
      filteredTransactions,
      searchQuery,
      splitPayment,
      transactions
    } = this.state;
  
    const matchingSplitPayments = {};
  
    transactions.forEach((transaction) => {
      const matchingSplitPayment = splitPayment.find(
        (split) => split.transId === transaction.id && parseFloat(split.balance) === 0
      );
      if (matchingSplitPayment) {
        matchingSplitPayments[transaction.id] = true;
      }
    });
  
    return (
      <div>
        <div className="go-back">
          <Link to="/Purchase">
            <i className='bx bx-chevron-left'></i>
          </Link>
        </div>
        <div id='sales-record-container'>
          <h1>Transaction Records</h1>
  
          <div className='date-range'>
            <label htmlFor="start-date">From</label>
            <input className='start-date' 
              type="date" 
              id="start-date" name="start-date" value={startDate} onChange={this.handleStartDateChange} />
            <label htmlFor="end-date">To</label>
            <input className='end-date' 
              type="date" 
              id="end-date" name="end-date" value={endDate} onChange={this.handleEndDateChange} />
            <button className='clear-date' onClick={this.handleClearDates}>Clear</button>
          </div>
  
          <div className='search-form'>
            <input
              className='search-bar'
              type='text'
              name='search-bar'
              value={searchQuery}
              onChange={(e) => this.handleSearch(e.target.value)}
              placeholder='Search...'
            />
            <i className='bx bx-search search-icon'></i>
          </div>
  
          <table className='sales-table'>
            <thead className='table-column'>
              <tr className='sales-column'>
                <th>Trans ID</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Money</th>
                <th>Change</th>
                <th>Trans Date</th>
                <th>Customer ID</th>
                <th>Customer</th>
                <th>Receipt No#</th>
                <th>Mode of Payment</th>
                <th>Acc No#</th>
                <th>Type of Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody className='table-rows'>
              {filteredTransactions.map((trans) => (
                <tr className={`sales-row ${matchingSplitPayments[trans.id] ? 'split-balance-passed' : ''}`} key={trans.id}>
                  <td>{trans.id}</td>
                  <td>{trans.items}</td>
                  <td>{trans.amount}</td>
                  <td>{trans.cash}</td>
                  {trans.typeOfPayment === "split" ? (
                    <td style={{
                      color: "#f7860e"
                    }}>-{trans.changeAmount}</td>
                  ) : (
                    <td>{trans.changeAmount}</td>
                  )}
                  <td>{this.formatDate(trans.transDate)}</td>
                  <td>{trans.customerId}</td>
                  <td>{trans.fName} {trans.lName}</td>
                  <td>{trans.receiptNo}</td>
                  <td>{trans.modeOfPayment}</td>
                  <td>{trans.accNo}</td>
                  <td>{trans.typeOfPayment}</td>
                  {trans.typeOfPayment === 'straight' ? (
                    <td className='select-split-row' style={{
                      backgroundColor: "#2c3157",
                      pointerEvents: "none",
                      textDecoration: "line-through"
                    }}>Pay</td>
                  ) : (
                    <td
                      id={`${trans.id}`}
                      onClick={() => {
                        this.handleSplitPayment(trans.id, trans.changeAmount, trans.customerId, trans.items);
                      }}
                      className={`select-split-row ${matchingSplitPayments[trans.id] ? 'split-balance-passed' : ''}`}
                    >Pay</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
}

export default Transactions;
