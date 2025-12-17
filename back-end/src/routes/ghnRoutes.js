const express = require('express');
const router = express.Router();
const axios = require('axios');
const { publicRateLimiter, strictRateLimiter } = require('../middleware/rateLimit.middleware');
const {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateShippingFee,
} = require('../services/ghnFunctionService');

// Lấy danh sách tỉnh/thành phố
router.get('/provinces', publicRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const data = await getProvinces(token);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách quận/huyện
router.get('/districts', publicRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const provinceId = parseInt(req.query.province_id);
    const data = await getDistricts(token, provinceId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách phường/xã
router.get('/wards', publicRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const districtId = parseInt(req.query.district_id);
    const data = await getWards(token, districtId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy các gói dịch vụ vận chuyển khả dụng
router.get('/services', publicRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const fromDistrict = parseInt(req.query.from_district);
    const toDistrict = parseInt(req.query.to_district);
    const data = await getAvailableServices(token, shopId, fromDistrict, toDistrict);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tính phí vận chuyển (áp dụng rate limit nghiêm ngặt hơn)
router.post('/fee', strictRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const params = req.body;
    const data = await calculateShippingFee(token, shopId, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API tính phí vận chuyển chỉ cần from_district_id, to_district_id, to_ward_code (áp dụng rate limit nghiêm ngặt)
router.post('/calc-fee-simple', strictRateLimiter, async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const { from_district_id, to_district_id, to_ward_code, height = 15, length = 15, width = 15, weight = 1000, insurance_value = 500000, coupon = null } = req.body;
    // Lấy dịch vụ vận chuyển khả dụng
    const services = await getAvailableServices(token, shopId, from_district_id, to_district_id);
    if (!services.data || services.data.length === 0) {
      return res.status(400).json({ error: 'Không có dịch vụ vận chuyển khả dụng cho tuyến này!' });
    }
    const serviceId = services.data.find(s => s.service_type_id === 2)?.service_id
      || services.data[0].service_id;
    // Tính phí vận chuyển
    const feeParams = {
      service_id: serviceId,
      from_district_id,
      to_district_id,
      to_ward_code,
      height,
      length,
      width,
      weight,
      insurance_value,
      coupon
    };
    const fee = await calculateShippingFee(token, shopId, feeParams);
    // Lấy tỷ giá động từ API nội bộ
    let usdRate = 1;
    try {
      const rateRes = await axios.get('http://localhost:9999/api/ghn/exchange-rate');
      const rateData = rateRes.data;
      if (rateData && rateData.success && rateData.rate) {
        usdRate = rateData.rate;
      }
    } catch (err) {
      // Nếu lỗi thì dùng tỷ giá mặc định
    }
    const data = fee?.data || {};
    // Tạo object giống GHN, chỉ đổi total và service_fee sang USD
    const dataCustom = { ...data };
    if (typeof dataCustom.total === 'number' && usdRate > 0) {
      // Nếu usdRate > 10 → coi như tỷ giá VND/USD (ví dụ 25,000 VND = 1 USD)
      // Nếu usdRate < 1 → coi như tỷ giá USD/VND (ví dụ 0.00004 USD = 1 VND)
      dataCustom.total = usdRate > 10
        ? +(dataCustom.total / usdRate).toFixed(2)
        : +(dataCustom.total * usdRate).toFixed(2);
    }

    if (typeof dataCustom.service_fee === 'number' && usdRate > 0) {
      dataCustom.service_fee = usdRate > 10
        ? +(dataCustom.service_fee / usdRate).toFixed(2)
        : +(dataCustom.service_fee * usdRate).toFixed(2);
    }
    res.json({
      code: fee.code,
      message: fee.message,
      usdRate,
      data: dataCustom
    });

  } catch (err) {
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
});
router.get('/exchange-rate', publicRateLimiter, async (req, res) => {
  try {
    // Sử dụng API miễn phí, có thể thay bằng API khác nếu cần
    const apiUrl = 'https://open.er-api.com/v6/latest/USD';
    const response = await axios.get(apiUrl);
    const data = response.data;
    if (data && data.rates && data.rates.VND) {
      res.json({
        success: true,
        rate: data.rates.VND,
        source: 'open.er-api.com',
        updated: data.time_last_update_utc
      });
    } else {
      res.status(500).json({ success: false, error: 'Không lấy được tỷ giá VND.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
// Route lấy tỷ giá USD/VND động từ exchangerate-api.com

