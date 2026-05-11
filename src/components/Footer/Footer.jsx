import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon"><Home size={18} /></div>
            <span>Property<span className="logo-accent">KING</span></span>
          </Link>
          <p className="footer-desc">
            The premium property listing platform for the US market.
            Find your dream home, list your property, and connect with
            verified agents — all in one place.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link"><FaFacebookF /></a>
            <a href="#" className="social-link"><FaTwitter /></a>
            <a href="#" className="social-link"><FaInstagram /></a>
            <a href="#" className="social-link"><FaLinkedinIn /></a>
            <a href="#" className="social-link"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/properties">All Properties</Link>
          <Link to="/properties?listing_type=sale">Buy</Link>
          <Link to="/properties?listing_type=rent">Rent</Link>
          <Link to="/list-property">List Property</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-links-group">
          <h4>Property Types</h4>
          <Link to="/properties?type=house">Houses</Link>
          <Link to="/properties?type=condo">Condos</Link>
          <Link to="/properties?type=townhouse">Townhouses</Link>
          <Link to="/properties?type=apartment">Apartments</Link>
          <Link to="/properties?type=land">Land</Link>
        </div>

        <div className="footer-links-group">
          <h4>Contact</h4>
          <a href="mailto:hello@propertyking.com" className="contact-item">
            <Mail size={14} /> hello@propertyking.com
          </a>
          <a href="tel:+18005551234" className="contact-item">
            <Phone size={14} /> 1-800-555-1234
          </a>
          <div className="contact-item">
            <MapPin size={14} /> New York, NY 10001
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} PropertyKING. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
