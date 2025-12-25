import React from "react";
import "./ReviewsPage.css";

const ReviewsPage = () => {
  const reviews = [
    {
      name: "Rahul Sharma",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      rating: 5,
      date: "2 days ago",
      service: "Digital Marketing",
      text: "The best digital marketing service! My business reached new levels. Highly recommended.",
      verified: true
    },
    {
      name: "Priya Kapoor",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      rating: 5,
      date: "5 days ago",
      service: "Google Reviews",
      text: "Very professional and fast delivery. Google reviews service is amazing.",
      verified: true
    },
    {
      name: "Manjunath Reddy",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      rating: 5,
      date: "1 week ago",
      service: "Brand Building",
      text: "PKC CAG completely transformed my online presence. Excellent work!",
      verified: true
    },
    {
      name: "Ananya Malhotra",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      rating: 5,
      date: "1 week ago",
      service: "Instagram Growth",
      text: "Outstanding service! They helped me grow my Instagram followers organically. The team is very responsive and knowledgeable.",
      verified: true
    },
    {
      name: "Vikram Patel",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      rating: 5,
      date: "2 weeks ago",
      service: "SEO Services",
      text: "Best decision for my startup! Their SEO strategies brought real results within weeks. Worth every penny.",
      verified: true
    },
    {
      name: "Sneha Reddy",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      rating: 5,
      date: "2 weeks ago",
      service: "Website Traffic",
      text: "Absolutely impressed with their dedication and professionalism. My website traffic doubled in just two months!",
      verified: true
    },
    {
      name: "Arjun Kumar",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      rating: 5,
      date: "3 weeks ago",
      service: "Business Consulting",
      text: "Fantastic team! They understood my business needs perfectly and delivered beyond expectations. Highly professional service.",
      verified: true
    },
    {
      name: "Divya Sharma",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      rating: 5,
      date: "3 weeks ago",
      service: "Social Media Marketing",
      text: "Their social media marketing strategies are top-notch! My engagement rates increased significantly. Thank you PKC CAG!",
      verified: true
    },
    {
      name: "Karthik Menon",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      rating: 5,
      date: "1 month ago",
      service: "Content Creation",
      text: "Amazing content creation service! The quality of work is exceptional and helped my brand stand out in a crowded market.",
      verified: true
    },
    {
      name: "Aishwarya Iyer",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
      rating: 5,
      date: "1 month ago",
      service: "Email Marketing",
      text: "Their email marketing campaigns generated impressive ROI. Professional, creative, and results-driven team!",
      verified: true
    },
    {
      name: "Rohan Desai",
      image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150",
      rating: 5,
      date: "1 month ago",
      service: "YouTube Growth",
      text: "My YouTube channel grew exponentially after working with PKC CAG. Their strategies are effective and sustainable.",
      verified: true
    },
    {
      name: "Meera Nair",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150",
      rating: 5,
      date: "1 month ago",
      service: "Online Reputation",
      text: "They helped clean up my online reputation and build a positive brand image. Couldn't be happier with the results!",
      verified: true
    },
    {
      name: "Siddharth Gupta",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      rating: 5,
      date: "2 months ago",
      service: "Local SEO",
      text: "Local SEO services brought customers directly to my store. The increase in foot traffic has been remarkable!",
      verified: true
    },
    {
      name: "Kavya Krishnan",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150",
      rating: 5,
      date: "2 months ago",
      service: "Facebook Ads",
      text: "Excellent Facebook advertising campaigns! The targeting was precise and the conversion rates exceeded expectations.",
      verified: true
    },
    {
      name: "Amit Verma",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
      rating: 5,
      date: "2 months ago",
      service: "LinkedIn Marketing",
      text: "Professional LinkedIn marketing service that helped me generate quality B2B leads. Highly recommend for business growth!",
      verified: true
    },
    {
      name: "Pooja Bansal",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
      rating: 5,
      date: "2 months ago",
      service: "Influencer Marketing",
      text: "Their influencer marketing connections are genuine and effective. My brand visibility increased tremendously!",
      verified: true
    }
  ];

  return (
    <div className="reviews-page">
      <div className="reviews-container">
        
        <div className="reviews-header">
          <h1 className="reviews-title">Customer Reviews</h1>
          <p className="reviews-subtitle">See what our clients say about our services</p>
          <div className="reviews-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <img src={review.image} alt={review.name} className="review-avatar" />
                <div className="review-info">
                  <div className="review-author">
                    {review.name}
                    {review.verified && (
                      <span className="verified-badge" title="Verified Customer">✓</span>
                    )}
                  </div>
                  <div className="review-meta">
                    <span className="review-service">{review.service}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="review-rating">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <div className="review-text">{review.text}</div>
              <div className="review-footer">
                <button className="helpful-btn">👍 Helpful</button>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-cta">
          <h2>Join Our Happy Customers!</h2>
          <p>Experience the difference with PKC CAG digital services</p>
          <button className="cta-button">Get Started Today</button>
        </div>

      </div>
    </div>
  );
};

export default ReviewsPage;
