import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <h3>Dev<span>Connect</span></h3>
            <p>Bridging the gap between talented developers and employees at top tech companies around the world.</p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <p>Find Employees</p>
            <p>For Developers</p>
            <p>Success Stories</p>
          </div>
          <div className="footer-col">
            <h3>Support</h3>
            <p>FAQ</p>
            <p>Contact Us</p>
            <p>Privacy Policy</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
