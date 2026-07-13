import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

const MENU_CATEGORIES = [
  { id: 'Cà Phê Pha Máy', icon: 'coffee' },
  { id: 'Sinh Tố & Trà Sữa', icon: 'bubble_chart' },
  { id: 'Trà & Trái Cây', icon: 'energy_savings_leaf' },
  { id: 'Bánh Ngọt', icon: 'bakery_dining' },
  { id: 'Quà Lưu Niệm', icon: 'local_mall' }
];

export const MENU_DATA: Record<string, any[]> = {
  'Cà Phê Pha Máy': [
    {
      id: 'hc-1',
      name: 'Caramel Cloud Macchiato',
      price: 57500,
      rating: 4.8,
      description: 'Lớp bọt sữa lạnh mềm mịn phủ trên lớp espresso cùng hương vani và xốt caramel.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf"
    },
    {
      id: 'hc-2',
      name: 'Nitro Velvet Brew',
      price: 49500,
      rating: 4.9,
      description: 'Ủ lạnh 20 tiếng và kết hợp với khí nitơ để tạo nên kết cấu siêu mịn, béo ngậy.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'hc-3',
      name: 'Classic Flat White',
      price: 45000,
      rating: 4.6,
      description: 'Hai shot espresso được chiết xuất hoàn hảo với lớp bọt sữa mỏng và siêu mịn.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnqJ2oXSFRtA0ryNB9aaYC2CyYGG_EVliGTodIT1ko3_4mwED6o3WhSyDUz4gFfHFuXMNcoZ8Ut3AdaYz2rooQIo8a5uU97WxsHKJPIgsWl1yZGv95X4meMJFTe0sY7VwXaEq69fFdtp0MBmW6Kuc42C4s1ELHt2s6-0v00VxRQ_-FfuBDTGLzpnwsa5BYYv00jS6frOt4pl4orUPlb8MunpQEEBTHVkKeL6_zDRRzsXfu8AleqBlc"
    },
    {
      id: 'hc-4',
      name: 'Winter Peppermint Mocha',
      price: 59500,
      rating: 4.9,
      description: 'Espresso đậm đà kết hợp với sô-cô-la đắng, si-rô bạc hà và kem tươi.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'hc-5',
      name: 'Hazelnut Praline Latte',
      price: 52500,
      rating: 4.7,
      description: 'Espresso êm dịu và sữa hấp kết hợp với si-rô hạt phỉ ngọt ngào.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'hc-6',
      name: 'Dark Mocha Truffle',
      price: 55000,
      rating: 4.8,
      description: 'Sô-cô-la đen nguyên chất hòa quyện cùng hai shot espresso và sữa mịn.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    }
  ],
  'Trà & Trái Cây': [
    {
      id: 'tb-1',
      name: 'Ceremonial Matcha Latte',
      price: 52500,
      rating: 4.7,
      description: 'Matcha nguyên chất được nghiền mịn pha cùng loại sữa tùy chọn để tăng cường sự tập trung.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    },
    {
      id: 'tb-2',
      name: 'Iced Hibiscus Zen',
      price: 42500,
      rating: 4.5,
      description: 'Hồng trà dâm bụt lắc tay với một chút hương chanh và vị ngọt dịu.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmg5WwGwQ6ZasKowi4EwiJgCRPnrou_8vsk79EXcOjHd2M_fntLBJlM2QBSg97zXHwKapV8b7EvTBvBErsIVCmSNZ56sdmJKzVPtqP7KpKjdm0-39q4Bqh6GfzGp6_w7kSk4X6ifzCJeFiNrrD-D4hLPEdGQJJcM9tsu6GcALjNz7wOwz9CfqMbeGKqRqlY0oyZiI6q1gsT6N7o1G4zBbhdgGG7Tz9pF2PDLNDsEcfkAEPX-p57av"
    },
    {
      id: 'tb-3',
      name: 'London Fog Earl Grey',
      price: 39500,
      rating: 4.8,
      description: 'Sự hòa quyện êm ái giữa trà Earl Grey, sữa hấp cùng chút hương vani và hoa oải hương.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlXk_e0Hn0zOqXzP1_Z3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1J3f1"
    },
    {
      id: 'tb-4',
      name: 'Honey Chamomile Dream',
      price: 45000,
      rating: 4.9,
      description: 'Trà thảo mộc thư giãn từ hoa cúc nguyên bông pha chút mật ong cỏ dại hữu cơ.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'tb-5',
      name: 'Exotic Dragon Refresh',
      price: 55000,
      rating: 4.6,
      description: 'Hỗn hợp tươi mát giữa thanh long, chanh dây và trà trắng, dùng với đá.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf"
    },
    {
      id: 'tb-6',
      name: 'Golden Ginger Glow',
      price: 47500,
      rating: 4.4,
      description: 'Thức uống thảo dược ấm áp từ gừng tươi, nghệ và tiêu đen, ngọt dịu vị mật ong.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    }
  ],
  'Sinh Tố & Trà Sữa': [
    {
      id: 'smt-1',
      name: 'Oolong Milk Tea',
      price: 48500,
      rating: 4.8,
      description: 'Trà Oolong rang cổ điển pha cùng sữa béo ngậy và chút đường đen.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOZn-rzgY3-0eTzFo51NLGFduXdcaJXtSTzb80iQQGWxC54cgzZS0N41q0Tqakdr9wAudUjTzfJrvKSyzEOayl861oFzYDfu_SYO2c-t2x92ORYFVQAIK0EMG9HyfGMOngsH5xCGdB86p6iaRzbWB_8PfVylIdjRL6ht1OmVVY0vlwzcy8qXH6PRENkxIgXLJQexWbsc8JveIYk1qkp0rJ4h4XioU1YA6JGaKksqCI8AIZf7vnUq1f"
    },
    {
      id: 'smt-2',
      name: 'Taro Coconut Cloud',
      price: 55000,
      rating: 4.7,
      description: 'Khoai môn ngọt bùi kết hợp với nước cốt dừa, tạo nên một giấc mơ màu tím.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'smt-3',
      name: 'Mango Sunrise Smoothie',
      price: 62500,
      rating: 4.9,
      description: 'Xoài Alfonso tươi xay cùng sữa chua mang đến hương vị nhiệt đới mát lạnh.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmg5WwGwQ6ZasKowi4EwiJgCRPnrou_8vsk79EXcOjHd2M_fntLBJlM2QBSg97zXHwKapV8b7EvTBvBErsIVCmSNZ56sdmJKzVPtqP7KpKjdm0-39q4Bqh6GfzGp6_w7kSk4X6ifzCJeFiNrrD-D4hLPEdGQJJcM9tsu6GcALjNz7wOwz9CfqMbeGKqRqlY0oyZiI6q1gsT6N7o1G4zBbhdgGG7Tz9pF2PDLNDsEcfkAEPX-p57av"
    },
    {
      id: 'smt-4',
      name: 'Matcha Boba Frost',
      price: 57500,
      rating: 4.8,
      description: 'Trà xanh matcha đá xay với trân châu dai ngon ở dưới đáy ly.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    },
    {
      id: 'smt-5',
      name: 'Strawberry Bliss',
      price: 60000,
      rating: 4.6,
      description: 'Sự kết hợp béo ngậy giữa dâu tây tươi và sữa, hoàn hảo cho một ngày nắng đẹp.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'smt-6',
      name: 'Hokkaido Milk Tea',
      price: 51500,
      rating: 4.9,
      description: 'Hồng trà sữa caramel rang đậm đà lấy cảm hứng từ hương vị béo ngậy của Hokkaido.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    }
  ],
  'Bánh Ngọt': [
    {
      id: 'pas-1',
      name: 'Almond Croissant',
      price: 45000,
      rating: 4.8,
      description: 'Bánh ngàn lớp thơm mùi bơ, nhân kem hạnh nhân ngọt ngào và phủ hạnh nhân nướng.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAlwhNX6VEn4w1bVqQuNP4PUn6Q2E4EJpS7Mpqgrd2OSfvPjEZvCHn4t8ywUAeAfoSgsNjiIJeJfYuRRGAEaF7BZmucXjsF_cHCyESl4UeEWOzc8Td9B_oGwhLagwLJn-u5e0L52t7AcC22VeNxjYmOxY58d-bY-quB2bZOQQBKSBmGonefSR9FSP3ejUE8Rn6wmpcqoveWKKO5jdvA9WG7MX81sq9371MSF_iGWKKbRA-nYfKd0gY"
    },
    {
      id: 'pas-2',
      name: 'Lavender Macaron',
      price: 32500,
      rating: 4.7,
      description: 'Vỏ bánh macaron hạnh nhân giòn tan với nhân kem ganache hương hoa oải hương.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47"
    },
    {
      id: 'pas-3',
      name: 'Lemon Drizzle Cake',
      price: 57500,
      rating: 4.9,
      description: 'Bánh bông lan chanh ẩm mịn tẩm si-rô cam chanh và phủ lớp đường bào ngọt ngào.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5PnNR9EJ9_C7qSwCOdp6yH1t5-DLWUqXtY4A5FMhwixIoOJyrBg3bK9e-_f1-tzeYsFanDAgNYJPf4VoznlqPppyyWKhfqWRSBYYn5TQaf3CfhjPggGJZGJx8ScOQik2WgFnbY1LzqDNtBXCIBehrlilZbnWITubGSTs5j-JrsLztnB5PrcdOqJe7-ZX-yOAwdYox_sfSDO1Wjg5TPhTGbVfBAhjQvmMRLZYHfjlgrIi7HSGnR0wd"
    },
    {
      id: 'pas-4',
      name: 'Butter Shortbread',
      price: 40000,
      rating: 4.8,
      description: 'Bánh quy bơ giòn kiểu Scotland, thơm lừng bơ và tan chảy trong miệng.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S"
    },
    {
      id: 'pas-5',
      name: 'Chocolate Babka',
      price: 55000,
      rating: 4.9,
      description: 'Bánh mì ngọt cuộn nhiều lớp nhân chocolate đen đậm đặc.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'pas-6',
      name: 'Blueberry Scone',
      price: 42500,
      rating: 4.6,
      description: 'Bánh scone bơ mềm xốp đầy ắp việt quất tươi và lớp men chanh nhẹ.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    }
  ],
  'Quà Lưu Niệm': [
    {
      id: 'merch-1',
      name: 'Ceramic Pour-Over Dripper',
      price: 240000,
      rating: 4.9,
      description: 'Phễu pha cà phê bằng sứ chuyên dụng cho nghi thức buổi sáng hoàn hảo.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc"
    },
    {
      id: 'merch-2',
      name: 'Matte Black Tumbler',
      price: 325000,
      rating: 4.8,
      description: 'Bình giữ nhiệt bằng thép không gỉ giúp giữ đồ uống nóng đến 12 giờ.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH"
    },
    {
      id: 'merch-3',
      name: 'Signature Canvas Tote',
      price: 180000,
      rating: 4.7,
      description: 'Túi tote canvas dày dặn thân thiện với môi trường có in logo cổ điển của chúng tôi.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z"
    },
    {
      id: 'merch-4',
      name: 'Artisan Whole Bean Blend',
      price: 195000,
      rating: 5.0,
      description: 'Hỗn hợp cà phê espresso rang đặc trưng của quán trong túi 1lb.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S"
    },
    {
      id: 'merch-5',
      name: 'Glass Teapot with Infuser',
      price: 380000,
      rating: 4.9,
      description: 'Ấm trà bằng thủy tinh borosilicate thanh lịch với lõi lọc bằng thép không gỉ.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47"
    },
    {
      id: 'merch-6',
      name: 'Bamboo Matcha Whisk',
      price: 150000,
      rating: 4.6,
      description: 'Chổi khuấy matcha bằng tre truyền thống với 100 ngạnh giúp đánh bọt hoàn hảo.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S"
    }
  ]
};

export default function Menu() {
  const { cart, addToCart } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('Cà Phê Pha Máy');
  
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
              <Link to="/" className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1">Thực Đơn</Link>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Ưu Đãi</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Câu Chuyện</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Cửa Hàng</a>
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
        <aside className="h-[calc(100vh-73px)] w-64 sticky top-[73px] hidden lg:flex flex-col gap-stack-md px-4 py-8 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant/10 z-40 overflow-y-auto">
          <div className="mb-stack-lg px-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 uppercase tracking-widest">Danh Mục</p>
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
            <p className="font-label-sm text-label-sm text-primary mb-1">Chào mừng trở lại</p>
            <p className="font-body-md text-on-surface mb-stack-md">Sẵn sàng nạp năng lượng chưa?</p>
            <button className="w-full py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
                Order Favorite
            </button>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 px-container-margin py-stack-lg w-0">
          
          {/* Hero Banner (Restored per HTML Request) */}
          <section className="relative h-[400px] rounded-3xl overflow-hidden mb-stack-lg group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 data-alt="A high-end, atmospheric shot of a creamy vanilla latte..." 
                 style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH')" }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-12">
              <span className="inline-block px-4 py-1 bg-tertiary text-on-tertiary rounded-full font-label-sm text-label-sm mb-4 self-start">
                  Ưu Đãi Giới Hạn
              </span>
              <h1 className="font-headline-lg text-headline-lg text-white max-w-lg mb-4 leading-tight">
                  Đánh thức giác quan với <span className="text-primary-fixed">Honey-Oak Latte</span>
              </h1>
              <p className="text-white/80 font-body-lg text-body-lg max-w-md mb-8">
                  Trải nghiệm sự cân bằng tinh tế của mật ong hoa cỏ dại và espresso ủ gỗ sồi.
              </p>
              <button className="w-fit px-8 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim transition-all active:scale-95">
                  Khám Phá Menu Theo Mùa
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
              <input className="w-full pl-12 pr-4 py-3 bg-white border border-primary/10 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface shadow-sm" placeholder="Tìm món đồ uống yêu thích..." type="text" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
              <button className="whitespace-nowrap px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm">Tất Cả</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Phổ Biến</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Món Mới</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Không Sữa</button>
            </div>
          </section>

          {/* Dynamic Menu Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-lg">
            {activeItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                <Link to={`/product/${item.id}`} className="relative h-64 overflow-hidden block">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                       style={{ backgroundImage: `url('${item.image}')` }}>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                      {item.price.toLocaleString()}đ
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{item.rating}</span>
                  </div>
                </Link>
                <div className="p-stack-md flex-1 flex flex-col">
                  <Link to={`/product/${item.id}`} className="block group-hover:opacity-80 transition-opacity">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{item.name}</h3>
                    <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 mb-4">
                        {item.description}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <Link to={`/product/${item.id}`} className="px-4 py-2 border-[1.5px] border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary/5 transition-colors">Tùy Chỉnh</Link>
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
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-tighter font-bold">Đang Chuẩn Bị</p>
                <h4 className="font-headline-md text-label-md text-on-surface">Món Vanilla Cold Brew của bạn đang được pha chế</h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm">Thời gian: 4 phút</span>
              <Link to="/tracking" className="text-primary font-label-md text-label-md hover:underline">Xem Chi Tiết</Link>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg max-w-7xl mx-auto gap-stack-md">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-gutter">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Chính Sách Bảo Mật</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Điều Khoản</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Bền Vững</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Tuyển Dụng</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Liên Hệ</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link to="/ai-suggest" className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group">
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">auto_awesome</span>
        <span className="font-label-md text-label-md">AI Gợi Ý</span>
      </Link>
    </div>
  );
}
