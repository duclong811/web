import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

const MENU_CATEGORIES = [
  { id: 'Hot Coffee', icon: 'coffee' },
  { id: 'Smoothies & Milk Tea', icon: 'bubble_chart' },
  { id: 'Tea & Botanicals', icon: 'energy_savings_leaf' },
  { id: 'Pastries', icon: 'bakery_dining' },
  { id: 'Merchandise', icon: 'local_mall' }
];

const MENU_DATA: Record<string, any[]> = {
  'Hot Coffee': [
    {
      id: 'hc-1',
      name: 'Caramel Cloud Macchiato',
      price: 5.75,
      rating: 4.8,
      description: 'Velvety cold foam layered over espresso with a hint of vanilla and caramel drizzle.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf"
    },
    {
      id: 'hc-2',
      name: 'Nitro Velvet Brew',
      price: 4.95,
      rating: 4.9,
      description: 'Slow-steeped for 20 hours and infused with nitrogen for an ultra-smooth, creamy texture.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'hc-3',
      name: 'Classic Flat White',
      price: 4.50,
      rating: 4.6,
      description: 'Expertly pulled double shot of espresso topped with a thin, silky layer of micro-foam.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnqJ2oXSFRtA0ryNB9aaYC2CyYGG_EVliGTodIT1ko3_4mwED6o3WhSyDUz4gFfHFuXMNcoZ8Ut3AdaYz2rooQIo8a5uU97WxsHKJPIgsWl1yZGv95X4meMJFTe0sY7VwXaEq69fFdtp0MBmW6Kuc42C4s1ELHt2s6-0v00VxRQ_-FfuBDTGLzpnwsa5BYYv00jS6frOt4pl4orUPlb8MunpQEEBTHVkKeL6_zDRRzsXfu8AleqBlc"
    },
    {
      id: 'hc-4',
      name: 'Winter Peppermint Mocha',
      price: 5.95,
      rating: 4.9,
      description: 'Rich espresso combined with bittersweet chocolate, peppermint syrup, and whipped cream.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'hc-5',
      name: 'Hazelnut Praline Latte',
      price: 5.25,
      rating: 4.7,
      description: 'Smooth espresso and steamed milk flavored with sweet hazelnut praline syrup.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'hc-6',
      name: 'Dark Mocha Truffle',
      price: 5.50,
      rating: 4.8,
      description: 'Intense dark chocolate melted into a double shot of espresso and velvet milk.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    }
  ],
  'Tea & Botanicals': [
    {
      id: 'tb-1',
      name: 'Ceremonial Matcha Latte',
      price: 5.25,
      rating: 4.7,
      description: 'Finely ground, high-grade matcha whisked with your choice of milk for a mindful boost.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    },
    {
      id: 'tb-2',
      name: 'Iced Hibiscus Zen',
      price: 4.25,
      rating: 4.5,
      description: 'Hand-shaken floral hibiscus tea with a splash of citrus and a touch of sweetness.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmg5WwGwQ6ZasKowi4EwiJgCRPnrou_8vsk79EXcOjHd2M_fntLBJlM2QBSg97zXHwKapV8b7EvTBvBErsIVCmSNZ56sdmJKzVPtqP7KpKjdm0-39q4Bqh6GfzGp6_w7kSk4X6ifzCJeFiNrrD-D4hLPEdGQJJcM9tsu6GcALjNz7wOwz9CfqMbeGKqRqlY0oyZiI6q1gsT6N7o1G4zBbhdgGG7Tz9pF2PDLNDsEcfkAEPX-p57av"
    },
    {
      id: 'tb-3',
      name: 'London Fog Earl Grey',
      price: 3.95,
      rating: 4.8,
      description: 'A comforting blend of Earl Grey tea, steamed milk, and a hint of vanilla and lavender.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlXk_e0Hn0zOqXzP1_Z3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1"
    },
    {
      id: 'tb-4',
      name: 'Honey Chamomile Dream',
      price: 4.50,
      rating: 4.9,
      description: 'A relaxing herbal infusion of whole chamomile flowers with a swirl of organic wild clover honey.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'tb-5',
      name: 'Exotic Dragon Refresh',
      price: 5.50,
      rating: 4.6,
      description: 'A refreshing blend of dragon fruit, passion fruit, and white tea, served over ice.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf"
    },
    {
      id: 'tb-6',
      name: 'Golden Ginger Glow',
      price: 4.75,
      rating: 4.4,
      description: 'A warming botanical tonic of fresh ginger, turmeric, and black pepper, sweetened with honey.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    }
  ],
  'Smoothies & Milk Tea': [
    {
      id: 'smt-1',
      name: 'Oolong Milk Tea',
      price: 4.85,
      rating: 4.8,
      description: 'Classic roasted Oolong infused with creamy milk and a touch of brown sugar.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOZn-rzgY3-0eTzFo51NLGFduXdcaJXtSTzb80iQQGWxC54cgzZS0N41q0Tqakdr9wAudUjTzfJrvKSyzEOayl861oFzYDfu_SYO2c-t2x92ORYFVQAIK0EMG9HyfGMOngsH5xCGdB86p6iaRzbWB_8PfVylIdjRL6ht1OmVVY0vlwzcy8qXH6PRENkxIgXLJQexWbsc8JveIYk1qkp0rJ4h4XioU1YA6JGaKksqCI8AIZf7vnUq1f"
    },
    {
      id: 'smt-2',
      name: 'Taro Coconut Cloud',
      price: 5.50,
      rating: 4.7,
      description: 'Sweet and earthy taro blended with coconut milk, creating a purple dream.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'smt-3',
      name: 'Mango Sunrise Smoothie',
      price: 6.25,
      rating: 4.9,
      description: 'Fresh Alfonso mangoes blended with yogurt for a tropical escape.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmg5WwGwQ6ZasKowi4EwiJgCRPnrou_8vsk79EXcOjHd2M_fntLBJlM2QBSg97zXHwKapV8b7EvTBvBErsIVCmSNZ56sdmJKzVPtqP7KpKjdm0-39q4Bqh6GfzGp6_w7kSk4X6ifzCJeFiNrrD-D4hLPEdGQJJcM9tsu6GcALjNz7wOwz9CfqMbeGKqRqlY0oyZiI6q1gsT6N7o1G4zBbhdgGG7Tz9pF2PDLNDsEcfkAEPX-p57av"
    },
    {
      id: 'smt-4',
      name: 'Matcha Boba Frost',
      price: 5.75,
      rating: 4.8,
      description: 'Iced blended matcha green tea with chewy tapioca pearls at the bottom.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    },
    {
      id: 'smt-5',
      name: 'Strawberry Bliss',
      price: 6.00,
      rating: 4.6,
      description: 'A creamy delight of fresh strawberries and milk, perfect for a sunny day.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'smt-6',
      name: 'Hokkaido Milk Tea',
      price: 5.15,
      rating: 4.9,
      description: 'Rich roasted caramel milk tea inspired by the creamy flavors of Hokkaido.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    }
  ],
  'Pastries': [
    {
      id: 'pas-1',
      name: 'Almond Croissant',
      price: 4.50,
      rating: 4.8,
      description: 'Flaky, buttery pastry filled with sweet almond cream and topped with toasted almonds.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAlwhNX6VEn4w1bVqQuNP4PUn6Q2E4EJpS7Mpqgrd2OSfvPjEZvCHn4t8ywUAeAfoSgsNjiIJeJfYuRRGAEaF7BZmucXjsF_cHCyESl4UeEWOzc8Td9B_oGwhLagwLJn-u5e0L52t7AcC22VeNxjYmOxY58d-bY-quB2bZOQQBKSBmGonefSR9FSP3ejUE8Rn6wmpcqoveWKKO5jdvA9WG7MX81sq9371MSF_iGWKKbRA-nYfKd0gY"
    },
    {
      id: 'pas-2',
      name: 'Lavender Macaron',
      price: 3.25,
      rating: 4.7,
      description: 'Delicate almond meringue shells filled with a fragrant lavender-infused ganache.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47"
    },
    {
      id: 'pas-3',
      name: 'Lemon Drizzle Cake',
      price: 5.75,
      rating: 4.9,
      description: 'A moist lemon sponge drenched in citrus syrup and topped with sweet icing.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5PnNR9EJ9_C7qSwCOdp6yH1t5-DLWUqXtY4A5FMhwixIoOJyrBg3bK9e-_f1-tzeYsFanDAgNYJPf4VoznlqPppyyWKhfqWRSBYYn5TQaf3CfhjPggGJZGJx8ScOQik2WgFnbY1LzqDNtBXCIBehrlilZbnWITubGSTs5j-JrsLztnB5PrcdOqJe7-ZX-yOAwdYox_sfSDO1Wjg5TPhTGbVfBAhjQvmMRLZYHfjlgrIi7HSGnR0wd"
    },
    {
      id: 'pas-4',
      name: 'Butter Shortbread',
      price: 4.00,
      rating: 4.8,
      description: 'Classic Scottish-style shortbread cookies, rich with butter and melt-in-your-mouth tender.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S"
    },
    {
      id: 'pas-5',
      name: 'Chocolate Babka',
      price: 5.50,
      rating: 4.9,
      description: 'Twisted sweet bread layered with rich dark chocolate fudge.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'pas-6',
      name: 'Blueberry Scone',
      price: 4.25,
      rating: 4.6,
      description: 'Tender buttery scone bursting with fresh blueberries and a light lemon glaze.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    }
  ],
  'Merchandise': [
    {
      id: 'merch-1',
      name: 'Ceramic Pour-Over Dripper',
      price: 24.00,
      rating: 4.9,
      description: 'Professional grade ceramic coffee dripper for the perfect morning ritual.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'merch-2',
      name: 'Matte Black Tumbler',
      price: 32.50,
      rating: 4.8,
      description: 'Insulated stainless steel tumbler to keep your brew hot for 12 hours.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'merch-3',
      name: 'Signature Canvas Tote',
      price: 18.00,
      rating: 4.7,
      description: 'Eco-friendly heavy canvas tote bag featuring our vintage logo.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'merch-4',
      name: 'Artisan Whole Bean Blend',
      price: 19.50,
      rating: 5.0,
      description: 'Our house-roasted signature espresso blend in a 1lb bag.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S"
    },
    {
      id: 'merch-5',
      name: 'Glass Teapot with Infuser',
      price: 38.00,
      rating: 4.9,
      description: 'Elegant borosilicate glass teapot with a stainless steel infuser core.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47"
    },
    {
      id: 'merch-6',
      name: 'Bamboo Matcha Whisk',
      price: 15.00,
      rating: 4.6,
      description: 'Traditional 100-prong bamboo chasen for the perfect frothy matcha.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    }
  ]
};

export default function Menu() {
  const { cart, addToCart } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('Hot Coffee');
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (id: string, name: string, price: number, image: string) => {
    addToCart({
      id,
      name,
      price,
      categoryId: activeCategory,
      description: '',
      image
    });
  };

  useEffect(() => {
    const cards = document.querySelectorAll('.group.bg-white');
    cards.forEach((card: any, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }, [activeCategory]);

  const activeItems = MENU_DATA[activeCategory] || [];

  return (
    <div className="font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen bg-background animate-in fade-in duration-500">
      {/* TopNavBar */}
      <nav className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm dark:shadow-none glass-header">
        <div className="flex justify-between items-center px-container-margin py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-stack-lg">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">AI-SMARTSERVE</Link>
            <div className="hidden md:flex gap-gutter items-center">
              <Link to="/" className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1">Menu</Link>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Rewards</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Our Story</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Locations</a>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <Link to="/tracking" className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95" title="Order Tracking">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </Link>
            <Link to="/cart" className="relative p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <ShoppingCart className="text-primary" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95" title="Staff Login">
              <span className="material-symbols-outlined text-primary">person</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto flex min-h-screen">
        {/* SideNavBar */}
        <aside className="h-full w-64 fixed left-[calc(50%-640px)] top-0 pt-24 hidden lg:flex flex-col gap-stack-md px-4 py-8 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant/10 z-40">
          <div className="mb-stack-lg px-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 uppercase tracking-widest">Categories</p>
          </div>
          <nav className="flex flex-col gap-2">
            {MENU_CATEGORIES.map(category => (
              <button 
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-transform active:translate-x-1 ${
                  activeCategory === category.id 
                  ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-bold' 
                  : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30'
                }`}
              >
                <span className="material-symbols-outlined" style={activeCategory === category.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {category.icon}
                </span>
                <span className="font-label-md text-label-md">{category.id}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-label-sm text-label-sm text-primary mb-1">Welcome back</p>
            <p className="font-body-md text-on-surface mb-stack-md">Ready for your caffeine fix?</p>
            <button className="w-full py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
                Order Favorite
            </button>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 px-container-margin py-stack-lg">
          
          {/* Hero Banner (Restored per HTML Request) */}
          <section className="relative h-[400px] rounded-3xl overflow-hidden mb-stack-lg group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 data-alt="A high-end, atmospheric shot of a creamy vanilla latte..." 
                 style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH')" }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-12">
              <span className="inline-block px-4 py-1 bg-tertiary text-on-tertiary rounded-full font-label-sm text-label-sm mb-4 self-start">
                  Limited Time Offer
              </span>
              <h1 className="font-headline-lg text-headline-lg text-white max-w-lg mb-4 leading-tight">
                  Awaken Your Senses with the New <span className="text-primary-fixed">Honey-Oak Latte</span>
              </h1>
              <p className="text-white/80 font-body-lg text-body-lg max-w-md mb-8">
                  Experience the delicate balance of wild clover honey and toasted oak-infused espresso.
              </p>
              <button className="w-fit px-8 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim transition-all active:scale-95">
                  Discover Seasonal Menu
              </button>
            </div>
          </section>

          {/* AI Combo Banner */}
          <section className="mb-stack-lg p-8 rounded-3xl bg-primary-container text-on-primary-container flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-primary/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md mb-1">Khám phá Combo dành riêng cho bạn</h2>
                <p className="font-body-md opacity-90">Sử dụng trí tuệ nhân tạo để tìm ra hương vị hoàn hảo cho ngày hôm nay của bạn.</p>
              </div>
            </div>
            <Link to="/ai-suggest" className="whitespace-nowrap px-8 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-sm inline-flex items-center justify-center">
                Thử ngay với AI
            </Link>
          </section>

          {/* Search and Filter Bar */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-gutter mb-stack-lg">
            <div className="relative w-full max-w-md group focus-within:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full pl-12 pr-4 py-3 bg-white border border-primary/10 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface shadow-sm" placeholder="Search for your favorite brew..." type="text" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
              <button className="whitespace-nowrap px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm">All Items</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Popular</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">New Arrivals</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Dairy-Free</button>
            </div>
          </section>

          {/* Dynamic Menu Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-lg">
            {activeItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                       style={{ backgroundImage: `url('${item.image}')` }}>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                      ${item.price.toFixed(2)}
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{item.rating}</span>
                  </div>
                </div>
                <div className="p-stack-md flex-1 flex flex-col">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{item.name}</h3>
                  <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 mb-4">
                      {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <button className="px-4 py-2 border-[1.5px] border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary/5 transition-colors">Customize</button>
                    <button 
                      className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all active:scale-90"
                      onClick={() => handleAddToCart(item.id, item.name, item.price, item.image)}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Active Order Status Card */}
          <section className="mt-stack-lg p-stack-md bg-secondary-container/30 border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white animate-pulse">coffee</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-tighter font-bold">In Preparation</p>
                <h4 className="font-headline-md text-label-md text-on-surface">Your Vanilla Cold Brew is being handcrafted</h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm">ETA: 4 mins</span>
              <Link to="/tracking" className="text-primary font-label-md text-label-md hover:underline">View Details</Link>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg max-w-7xl mx-auto gap-stack-md">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 AI-SMARTSERVE. Handcrafted for your daily ritual.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-gutter">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Sustainability</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Careers</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link to="/ai-suggest" className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group">
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">auto_awesome</span>
        <span className="font-label-md text-label-md">AI Suggest</span>
      </Link>
    </div>
  );
}
