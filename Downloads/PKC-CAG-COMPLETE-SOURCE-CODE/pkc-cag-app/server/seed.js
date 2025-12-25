require('dotenv').config();
const connectDB = require('./config/database');
const Service = require('./models/Service');
const User = require('./models/User');

const services = [
  {
    name: 'Google Reviews Boost',
    slug: 'google-reviews',
    description: 'Enhance your online reputation with authentic 4-5 star Google reviews from real users.',
    icon: 'fas fa-star',
    category: 'reviews',
    features: [
      '5-50 authentic reviews',
      'Real reviewer profiles',
      'Geographic targeting',
      '24-72 hour delivery',
      '4.5-5 star guarantee'
    ],
    pricing: {
      basic: {
        price: 2999,
        description: '10 Google Reviews',
        features: ['10 authentic 5-star reviews', 'Real profiles', 'Geographic targeting', '48-hour delivery']
      },
      standard: {
        price: 4999,
        description: '25 Google Reviews',
        features: ['25 authentic 5-star reviews', 'Real profiles', 'Geographic targeting', '48-hour delivery', 'Priority support']
      },
      premium: {
        price: 8999,
        description: '50 Google Reviews',
        features: ['50 authentic 5-star reviews', 'Real profiles', 'Geographic targeting', '24-hour delivery', 'Dedicated support', 'Monthly refresh']
      }
    },
    deliveryTime: '24-72 hours',
    isActive: true
  },
  {
    name: 'Premium Website Design',
    slug: 'website-design',
    description: 'Custom, mobile-responsive websites that convert visitors into loyal customers.',
    icon: 'fas fa-laptop-code',
    category: 'website',
    features: [
      'Custom responsive design',
      'Mobile-first approach',
      'Lightning-fast loading',
      'SEO optimization',
      'Modern UI/UX'
    ],
    pricing: {
      basic: {
        price: 14999,
        description: 'Landing Page',
        features: ['1 Page design', 'Mobile responsive', 'Contact form', 'Basic SEO', '3 revisions']
      },
      standard: {
        price: 29999,
        description: 'Business Website',
        features: ['5 Page design', 'Mobile responsive', 'CMS integration', 'Advanced SEO', 'Social media integration', '5 revisions']
      },
      premium: {
        price: 59999,
        description: 'E-commerce Website',
        features: ['Unlimited pages', 'E-commerce functionality', 'Payment gateway', 'Advanced features', 'Priority support', 'Unlimited revisions']
      }
    },
    deliveryTime: '7-14 days',
    isActive: true
  },
  {
    name: 'Google My Business Setup',
    slug: 'google-my-business',
    description: 'Complete GMB setup and optimization to dominate local search results.',
    icon: 'fab fa-google',
    category: 'reviews',
    features: [
      'Complete profile setup',
      'Business optimization',
      'Photo & video uploads',
      'Local SEO mastery',
      'Review management'
    ],
    pricing: {
      basic: {
        price: 3999,
        description: 'GMB Setup',
        features: ['Profile creation', 'Basic optimization', 'Photo upload', 'Business verification']
      },
      standard: {
        price: 6999,
        description: 'GMB Pro',
        features: ['Complete setup', 'Advanced optimization', 'Photo & video upload', 'Posts setup', 'Monthly management']
      },
      premium: {
        price: 12999,
        description: 'GMB Enterprise',
        features: ['Everything in Pro', 'Review management', 'Q&A management', 'Competitor analysis', 'Monthly reporting', '24/7 support']
      }
    },
    deliveryTime: '24-48 hours',
    isActive: true
  },
  {
    name: 'Instagram Growth',
    slug: 'instagram-growth',
    description: 'Explosive Instagram growth with real followers and massive engagement.',
    icon: 'fab fa-instagram',
    category: 'social-media',
    features: [
      '500-5000 real followers',
      'Story views & engagement',
      'Reel promotion',
      'Profile optimization',
      'Hashtag strategy'
    ],
    pricing: {
      basic: {
        price: 4999,
        description: '1000 Followers',
        features: ['1000 real followers', 'Profile optimization', 'Hashtag strategy', '1 month support']
      },
      standard: {
        price: 8999,
        description: '2500 Followers',
        features: ['2500 real followers', 'Story views boost', 'Reel promotion', 'Content strategy', '2 months support']
      },
      premium: {
        price: 14999,
        description: '5000 Followers',
        features: ['5000 real followers', 'Premium engagement', 'Viral reel strategy', 'Influencer collaboration', '3 months support']
      }
    },
    deliveryTime: '7-15 days',
    isActive: true
  },
  {
    name: 'Facebook Marketing',
    slug: 'facebook-marketing',
    description: 'Complete Facebook marketing with reviews, likes, and engagement boost.',
    icon: 'fab fa-facebook',
    category: 'social-media',
    features: [
      '5-star page reviews',
      'Page likes & followers',
      'Post engagement',
      'Ad campaign setup',
      'Content strategy'
    ],
    pricing: {
      basic: {
        price: 3999,
        description: '500 Page Likes',
        features: ['500 page likes', 'Basic engagement', 'Profile optimization']
      },
      standard: {
        price: 6999,
        description: '1500 Page Likes + Reviews',
        features: ['1500 page likes', '25 5-star reviews', 'Post boost', 'Ad campaign setup']
      },
      premium: {
        price: 11999,
        description: '3000 Page Likes + Marketing',
        features: ['3000 page likes', '50 5-star reviews', 'Complete marketing', 'Monthly strategy', 'Dedicated manager']
      }
    },
    deliveryTime: '5-10 days',
    isActive: true
  },
  {
    name: 'YouTube Growth',
    slug: 'youtube-growth',
    description: 'Viral YouTube growth with subscribers, views, and channel optimization.',
    icon: 'fab fa-youtube',
    category: 'social-media',
    features: [
      '100-2000 subscribers',
      'High-retention views',
      'Engagement boost',
      'SEO optimization',
      'Thumbnail design'
    ],
    pricing: {
      basic: {
        price: 5999,
        description: '500 Subscribers',
        features: ['500 real subscribers', '5000 views', 'Channel optimization', 'SEO setup']
      },
      standard: {
        price: 9999,
        description: '1000 Subscribers',
        features: ['1000 real subscribers', '15000 views', 'Advanced SEO', 'Thumbnail design', 'Content strategy']
      },
      premium: {
        price: 17999,
        description: '2000 Subscribers',
        features: ['2000 real subscribers', '30000 views', 'Premium optimization', 'Viral strategy', 'Monetization support']
      }
    },
    deliveryTime: '10-20 days',
    isActive: true
  },
  {
    name: 'Complete Digital Package',
    slug: 'complete-package',
    description: 'Everything your business needs for complete digital domination and explosive growth.',
    icon: 'fas fa-crown',
    category: 'complete-package',
    features: [
      'Premium website design',
      '50 Google 5-star reviews',
      'Complete GMB setup',
      'All social media growth',
      'Monthly strategy calls',
      'VIP 12-hour delivery'
    ],
    pricing: {
      basic: {
        price: 49999,
        description: 'Starter Package',
        features: ['Landing page website', '25 Google reviews', 'GMB setup', '1000 Instagram followers', 'Facebook page boost']
      },
      standard: {
        price: 89999,
        description: 'Growth Package',
        features: ['5-page website', '50 Google reviews', 'Complete GMB', '2500 Instagram followers', 'All social media', 'Monthly strategy']
      },
      premium: {
        price: 149999,
        description: 'Enterprise Package',
        features: ['E-commerce website', '100 Google reviews', 'Complete digital presence', '5000 followers on all platforms', 'Dedicated team', 'Weekly calls']
      }
    },
    deliveryTime: '14-30 days',
    isActive: true,
    isPremium: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing services
    await Service.deleteMany({});
    console.log('✅ Cleared existing services');

    // Insert services
    await Service.insertMany(services);
    console.log('✅ Services seeded successfully');

    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'pkccag@gmail.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'PKC CAG Admin',
        email: adminEmail,
        password: 'Admin@123',
        isAdmin: true,
        isVerified: true
      });
      console.log('✅ Admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: Admin@123');
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
