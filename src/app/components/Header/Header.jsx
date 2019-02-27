import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import FaUserSecret from "react-icons/lib/fa/user-secret";
import FaSignOut from "react-icons/lib/fa/sign-out";
import FaSignIn from "react-icons/lib/fa/sign-in";
import kanbanLogo from "../../../assets/images/kanban-logo.svg";
import SearchBar from "./SearchBar";
import "./Header.scss";
import { withTranslation } from 'react-i18next';

class Header extends Component {
  static propTypes = { user: PropTypes.object };
  
  render = () => {
    const { user } = this.props;
    const { t, i18n } = this.props;

    return (
      <header>
        <div className="header-left-side">
          <Link to="/" className="header-title">
            <img src={kanbanLogo} alt="React Kanban logo" />
            &nbsp;AmanBoard 2
          </Link>
          <div className="header-search-bar">
            <SearchBar />
          </div>
        </div>
        <div className="header-right-side">
          {user ? <p> {user.name} </p> : <p> </p>}
          {user ? (
            <a className="signout-link" href="/auth/signout">
              <FaSignOut className="signout-icon" />
              &nbsp; {t('Sign-out')}
            </a>
          ) : (
            <a className="signout-link" href="/">
              <FaSignIn className="signout-icon" />
              &nbsp;{t('Sign-in')}
            </a>
          )}
        </div>
      </header>
    );
  };
}

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(withTranslation()(Header));
