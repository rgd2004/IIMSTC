const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "instagram",
        "facebook",
        "youtube",
        "twitter",
        "telegram",
        "reviews",
        "gmb",
        "website",
        "seo"
      ],
    },

    description: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "fas fa-star",
    },

    features: {
      type: [String],
      default: [],
    },

    // Pricing values
    serviceId: {
      type: String,
      unique: true,
      index: true,
    },

    pricePer1000: {
      type: Number,
      default: 0,
    },

    pricePerUnit: {
      type: Number,
      default: 0,
    },

    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    deliveryTime: {
      type: String,
      default: "24–72 hours",
    },

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Auto calculate unit price
serviceSchema.pre("save", async function () {
  // ensure a short 4-digit numeric serviceId exists and is unique
  if (!this.serviceId) {
    const Service = mongoose.model('Service');
    let attempts = 0;
    let assigned = false;
    while (attempts < 6 && !assigned) {
      const candidate = String(Math.floor(1000 + Math.random() * 9000));
      // check uniqueness
      // eslint-disable-next-line no-await-in-loop
      const exists = await Service.exists({ serviceId: candidate });
      if (!exists) {
        this.serviceId = candidate;
        assigned = true;
        break;
      }
      attempts += 1;
    }
    if (!assigned) {
      // fallback to timestamp-based id
      this.serviceId = String(Date.now()).slice(-4);
    }
  }

  if (this.pricePer1000 > 0) {
    this.unitPrice = this.pricePer1000 / 1000;
  }

  if (this.pricePerUnit > 0) {
    this.unitPrice = this.pricePerUnit;
  }
});

module.exports = mongoose.model("Service", serviceSchema);
