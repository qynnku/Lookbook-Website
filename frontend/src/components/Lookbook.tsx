import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import TopNav from './TopNav';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

const imgImage1 = "https://www.figma.com/api/mcp/asset/08f08cdf-b0b7-4be4-8716-78676eeec441";
const img5 = "https://www.figma.com/api/mcp/asset/5f6a2d07-1f44-43a1-9c7b-f6737d527372";
const img6 = "https://www.figma.com/api/mcp/asset/ef1ac569-292e-488f-9af5-e57787082371";
const img4 = "https://www.figma.com/api/mcp/asset/feee2a36-aabd-48bd-b390-3b03858d0298";
const imgFrame = "https://www.figma.com/api/mcp/asset/53b49331-3ae0-4764-b125-30e34d70b292";
const imgFrame1 = "https://www.figma.com/api/mcp/asset/002508b0-0b94-4c77-8121-9393b0d94518";
const imgFrame2 = "https://www.figma.com/api/mcp/asset/e0cb8a3a-1f7b-475c-ac3d-b6a8d11ec8f3";
const imgFrame3 = "https://www.figma.com/api/mcp/asset/f507b3e1-4a04-41a0-9f54-c4df793a02cd";
const imgFrame4 = "https://www.figma.com/api/mcp/asset/1060398c-4d24-47fe-92d8-dbfdca6408b9";
const imgFrame5 = "https://www.figma.com/api/mcp/asset/4d737420-6bd0-42a0-a77a-226c722e5c41";
const imgFrame6 = "https://www.figma.com/api/mcp/asset/6df30410-a15d-4e66-b127-fd3ebed7c52f";
const imgEllipse37 = "https://www.figma.com/api/mcp/asset/2cdd4149-b523-499b-8791-d2e2645a10ff";
const imgEllipse38 = "https://www.figma.com/api/mcp/asset/0b4b67f2-f6b4-42b4-838c-933787ab4a48";
const imgEllipse39 = "https://www.figma.com/api/mcp/asset/d38e0305-834a-4033-a910-581b17e62bc1";
const imgLine15 = "https://www.figma.com/api/mcp/asset/a78b28c5-0288-45e9-8b2e-bca2e9efd227";
const img7 = "https://www.figma.com/api/mcp/asset/44ba12b8-4f51-4d72-805c-8c98590baee7";

type LookbookPageProps = {
  onNavigate?: (label: string) => void;
  pendingCount?: number;
};

type LookbookItem = {
  id: number;
  name: string;
  description: string | null;
  link: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  imagesUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const Lookbook: React.FC<LookbookPageProps> = ({ onNavigate, pendingCount = 0 }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'platform' | 'orders'>('platform');
  const [showStats, setShowStats] = useState<{ [key: number]: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedLookbookId, setSelectedLookbookId] = useState<number | null>(null);
  const [lookbooks, setLookbooks] = useState<LookbookItem[]>([]);
  const [editLookbook, setEditLookbook] = useState<LookbookItem | null>(null);
  const [newLookbook, setNewLookbook] = useState({
    name: '',
    description: '',
    link: '',
    image: null as File | null,
    banner: null as File | null,
    gallery: [] as File[],
  });
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    link: '',
    image: null as File | null,
    banner: null as File | null,
    gallery: [] as File[],
    removedGalleryImages: [] as string[],
  });

  // Load lookbooks on mount
  useEffect(() => {
    loadLookbooks();
  }, []);

  const loadLookbooks = async () => {
    try {
      const response = await apiFetch('/lookbooks');
      if (!response.ok) throw new Error('Failed to load lookbooks');
      const data = await response.json();
      setLookbooks(data);
    } catch (error) {
      console.error('Error loading lookbooks:', error);
    }
  };

  const handleCreateLookbook = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newLookbook.name);
      if (newLookbook.description) formData.append('description', newLookbook.description);
      if (newLookbook.link) formData.append('link', newLookbook.link);
      if (newLookbook.image) formData.append('image', newLookbook.image);
      if (newLookbook.banner) formData.append('banner', newLookbook.banner);
      
      // Add gallery images
      newLookbook.gallery.forEach((file, index) => {
        formData.append('gallery', file);
      });

      const response = await apiFetch('/lookbooks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create lookbook failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to create lookbook');
      }
      
      // Reload lookbooks after creation
      setShowCreateModal(false);
      setNewLookbook({ name: '', description: '', link: '', image: null, banner: null, gallery: [] });
      loadLookbooks();
    } catch (error: any) {
      console.error('Error creating lookbook:', error);
      alert(`Không thể tạo lookbook: ${error.message || 'Vui lòng thử lại.'}`);
    }
  };

  const toggleStats = (lookbookId: number) => {
    setShowStats(prev => ({ ...prev, [lookbookId]: !prev[lookbookId] }));
  };

  const openGalleryModal = (lookbookId: number) => {
    setSelectedLookbookId(lookbookId);
    setShowGalleryModal(true);
  };

  const openEditModal = (lookbook: LookbookItem) => {
    setEditLookbook(lookbook);
    setEditData({
      name: lookbook.name,
      description: lookbook.description || '',
      link: lookbook.link || '',
      image: null,
      banner: null,
      gallery: [],
      removedGalleryImages: [],
    });
    setShowEditModal(true);
  };

  const getGalleryImages = (): string[] => {
    if (!selectedLookbookId) return [];
    const lookbook = lookbooks.find(l => l.id === selectedLookbookId);
    if (!lookbook || !lookbook.imagesUrl) return [];
    return lookbook.imagesUrl.split(',').filter(url => url.trim());
  };

  const getEditGalleryImages = (): string[] => {
    if (!editLookbook || !editLookbook.imagesUrl) return [];
    return editLookbook.imagesUrl
      .split(',')
      .filter(url => url.trim())
      .filter(url => !editData.removedGalleryImages.includes(url));
  };

  const removeGalleryImage = (imageUrl: string) => {
    setEditData(prev => ({
      ...prev,
      removedGalleryImages: [...prev.removedGalleryImages, imageUrl],
    }));
  };

  const handleUpdateLookbook = async () => {
    if (!editLookbook) return;
    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      formData.append('link', editData.link);
      
      if (editData.image) formData.append('image', editData.image);
      if (editData.banner) formData.append('banner', editData.banner);
      
      editData.gallery.forEach((file) => {
        formData.append('gallery', file);
      });

      formData.append('removedGalleryImages', JSON.stringify(editData.removedGalleryImages));

      const token = localStorage.getItem('token');
      const response = await apiFetch(`/lookbooks/${editLookbook.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update lookbook');
      
      setShowEditModal(false);
      loadLookbooks();
    } catch (error) {
      console.error('Error updating lookbook:', error);
      alert('Không thể cập nhật lookbook. Vui lòng thử lại.');
    }
  };

  const handleDeleteLookbook = async () => {
    if (!editLookbook) return;
    if (!window.confirm(`Bạn có chắc muốn xóa lookbook "${editLookbook.name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/lookbooks/${editLookbook.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lookbook');
      
      setShowEditModal(false);
      loadLookbooks();
      alert('Lookbook đã được xóa thành công!');
    } catch (error) {
      console.error('Error deleting lookbook:', error);
      alert('Không thể xóa lookbook. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Layout */}
      <div className="flex-1 flex w-full">
        {/* Combined Sidebar and Channel List */}
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Lookbook" onSelect={onNavigate} pendingCount={pendingCount} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-[1104px]">
        <TopNav pendingCount={pendingCount} />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-[30px] py-[10px]">
          <div className="pl-[21px] pr-[50px] py-[18px] flex items-center justify-between">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black">
              Lookbook
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-[10px] py-[5px] border border-black rounded-[7px] bg-white font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-black hover:bg-[#f5f5f5] flex gap-[5px] items-center"
            >
              <span>Tạo mới</span>
              <svg className="w-[8px] h-[8px]" viewBox="0 0 8 8" fill="none">
                <path d="M4 0v8M0 4h8" stroke="black" strokeWidth="1" />
              </svg>
            </button>
          </div>

          {/* Lookbooks List */}
          {lookbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[100px] gap-[20px]">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[16px] text-[#737373]">
                Chưa có lookbook nào. Tạo lookbook đầu tiên của bạn!
              </p>
            </div>
          ) : (
            lookbooks.map((lookbook) => (
              <div key={lookbook.id} className="mb-[50px]">
                {/* Lookbook Image Section */}
                <div className="w-full mb-[30px]">
                  <div 
                    className="relative h-[430px] w-full overflow-hidden rounded-[8px] cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGalleryModal(lookbook.id)}
                  >
                    <img 
                      src={lookbook.bannerUrl || imgImage1} 
                      alt={lookbook.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(45,45,45,0.83)]" />
                    <p className="absolute bottom-[36px] left-[36px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[24px] leading-[32px] text-white">
                      {lookbook.name}
                    </p>
                    {getGalleryImages().length > 0 && (
                      <div className="absolute bottom-[36px] right-[36px] bg-white bg-opacity-90 px-[12px] py-[6px] rounded-[6px] text-[14px] font-semibold text-black">
                        {getGalleryImages().length} ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* View Summary and Action Buttons */}
                <div className="flex items-center justify-between mb-[31px] pb-[18px]">
                  <button 
                    onClick={() => toggleStats(lookbook.id)}
                    className="flex items-center gap-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330] hover:text-[#9a67ca] transition-colors cursor-pointer"
                  >
                    Xem Tổng quan tương tác của {lookbook.name}
                    <span className={`transition-transform duration-300 ${showStats[lookbook.id] ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className="flex gap-[20px]">
                    <button 
                      onClick={() => openEditModal(lookbook)}
                      className="px-[20px] py-[5px] border border-black rounded-[7px] bg-white font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-black hover:bg-[#f5f5f5]">
                      Sửa
                    </button>
                  </div>
                </div>

                {/* Stats Grid - Collapsible */}
                {showStats[lookbook.id] && (
          <div className="grid grid-cols-2 gap-[30px] mb-[31px]">
            {/* Left Column */}
            <div className="flex flex-col gap-[30px]">
              {/* Multimedia Card */}
              <div className="bg-white border border-[#d4d4d4] rounded-[16px] shadow-[0_0_4.6px_rgba(0,0,0,0.16)] p-[30px]">
                <div className="pb-[18px] border-b border-[#d4d4d4] mb-[18px]">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] leading-[24px] text-[#404040]">
                    Truyền thông đa phương tiện
                  </p>
                </div>

                <div className="flex flex-col gap-[18px]">
                  {/* Total Viewers */}
                  <div>
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040] mb-[10px]">
                      Tổng số lượng người xem
                    </p>
                    <div className="flex gap-[10px] items-center">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black">
                        {lookbook.totalViewers.toLocaleString()}
                      </p>
                      <div className="bg-white border border-[#737373] rounded-[8px] px-[4px] py-[4px] flex gap-[4px] items-center">
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                          0%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Bars */}
                  <div className="flex gap-[17px] items-center h-[9px]">
                    <div className="h-full bg-[#7037a5] rounded-[6px] w-[166px]" />
                    <div className="h-full bg-[#ac87ce] rounded-[6px] w-[111px]" />
                    <div className="h-full bg-[#e4e4ff] rounded-[6px] w-[100px]" />
                  </div>

                  {/* Legend */}
                  <div className="flex gap-[28px]">
                    <div className="flex gap-[6px] items-center">
                      <div className="w-[7px] h-[7px]">
                        <img src={imgEllipse37} alt="" className="w-full h-full" />
                      </div>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] text-black">
                        Facebook
                      </p>
                    </div>
                    <div className="flex gap-[6px] items-center">
                      <div className="w-[7px] h-[7px]">
                        <img src={imgEllipse38} alt="" className="w-full h-full" />
                      </div>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] text-black">
                        Thread
                      </p>
                    </div>
                    <div className="flex gap-[6px] items-center">
                      <div className="w-[7px] h-[7px]">
                        <img src={imgEllipse39} alt="" className="w-full h-full" />
                      </div>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] text-black">
                        Instagram
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[0] border-t border-[#e4e4e4]" />

                  {/* Platform Details */}
                  <div className="flex flex-col gap-[11px]">
                    {/* Facebook */}
                    <div className="flex items-center justify-between p-[10px] bg-white">
                      <div className="flex gap-[10px] items-center">
                        <img src={img4} alt="" className="w-[14px] h-[14px]" />
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#1a0330]">
                          Facebook
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-[118px]">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-black">
                          {lookbook.facebookViews.toLocaleString()}
                        </p>
                        <div className="flex gap-[2px] items-center">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#737373]">
                            {Math.round((lookbook.facebookViews / lookbook.totalViewers) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Thread */}
                    <div className="flex items-center justify-between p-[10px] bg-white">
                      <div className="flex gap-[10px] items-center">
                        <div className="bg-[#080808] rounded-[2px] w-[15px] h-[15px] flex items-center justify-center overflow-hidden">
                          <img src={img6} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#1a0330]">
                          Thread
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-[118px]">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-black">
                          {lookbook.threadViews.toLocaleString()}
                        </p>
                        <div className="flex gap-[2px] items-center">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#737373]">
                            {Math.round((lookbook.threadViews / lookbook.totalViewers) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center justify-between p-[10px] bg-white">
                      <div className="flex gap-[10px] items-center">
                        <img src={img5} alt="" className="w-[14px] h-[14px] object-cover" />
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#1a0330]">
                          Instagram
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-[118px]">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-black">
                          {lookbook.instagramViews.toLocaleString()}
                        </p>
                        <div className="flex gap-[2px] items-center">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] text-[#737373]">
                            {Math.round((lookbook.instagramViews / lookbook.totalViewers) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-[30px]">
              {/* Row 1 - 2 Cards */}
              <div className="flex gap-[26px]">
                {/* New Customer Reach Card */}
                <div className="flex-1 bg-white border border-[#d4d4d4] rounded-[16px] shadow-[0_0_4.6px_rgba(0,0,0,0.16)] p-[16px] flex flex-col justify-center gap-[18px]">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040]">
                    Tiếp cận khách hàng mới
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] leading-[26px] text-black">
                      {lookbook.newCustomerReach.toLocaleString()}
                    </p>
                    <img src={img7} alt="" className="w-[21.433px] h-[21.433px]" />
                  </div>
                  <div className="flex gap-[10px] items-end">
                    <div className="bg-white border border-[#737373] rounded-[8px] px-[4px] py-[4px] flex gap-[4px] items-center">
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                        0%
                      </span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                      0 hôm nay
                    </p>
                  </div>
                </div>

                {/* Post Views Card */}
                <div className="flex-1 bg-white border border-[#d4d4d4] rounded-[16px] shadow-[0_0_4.6px_rgba(0,0,0,0.16)] p-[16px] flex flex-col justify-center gap-[18px]">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040]">
                    Lượt xem bài đăng
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] leading-[26px] text-black">
                      {lookbook.postViews.toLocaleString()}
                    </p>
                    <img src={imgFrame3} alt="" className="w-[21.433px] h-[21.433px]" />
                  </div>
                  <div className="flex gap-[10px] items-end">
                    <div className="bg-white border border-[#737373] rounded-[8px] px-[4px] py-[4px] flex gap-[4px] items-center">
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                        0%
                      </span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                      0 hôm nay
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2 - 2 Cards */}
              <div className="flex gap-[26px]">
                {/* Page Visits Card */}
                <div className="flex-1 bg-white border border-[#d4d4d4] rounded-[16px] shadow-[0_0_4.6px_rgba(0,0,0,0.16)] p-[16px] flex flex-col justify-center gap-[18px]">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040]">
                    Lượng truy cập trang
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] leading-[26px] text-black">
                      {lookbook.pageVisits.toLocaleString()}
                    </p>
                    <img src={imgFrame5} alt="" className="w-[21.433px] h-[21.433px]" />
                  </div>
                  <div className="flex gap-[10px] items-end">
                    <div className="bg-white border border-[#737373] rounded-[8px] px-[4px] py-[4px] flex gap-[4px] items-center">
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                        0%
                      </span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                      0 hôm nay
                    </p>
                  </div>
                </div>

                {/* Content Performance Card */}
                <div className="flex-1 bg-white border border-[#d4d4d4] rounded-[16px] shadow-[0_0_4.6px_rgba(0,0,0,0.16)] p-[16px] flex flex-col justify-center gap-[18px]">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040]">
                    Hiệu suất nội dung
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] leading-[26px] text-black">
                      {lookbook.contentScore.toLocaleString()}
                    </p>
                    <img src={imgFrame6} alt="" className="w-[21.433px] h-[21.433px]" />
                  </div>
                  <div className="flex gap-[10px] items-end">
                    <div className="bg-white border border-[#737373] rounded-[8px] px-[4px] py-[4px] flex gap-[4px] items-center">
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                        0%
                      </span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] text-[#737373]">
                      0 hôm nay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
    {/* Page Footer */}
    <FooterBar />

    {/* Create Lookbook Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[16px] w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-[30px] py-[20px] border-b border-[#d4d4d4]">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-black">
              Tạo Lookbook mới
            </h2>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="text-[24px] text-[#737373] hover:text-black transition-colors"
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-[30px] py-[24px] flex flex-col gap-[20px]">
            {/* Tên lookbook */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Tên Lookbook
              </label>
              <input
                type="text"
                value={newLookbook.name}
                onChange={(e) => setNewLookbook({ ...newLookbook, name: e.target.value })}
                placeholder="Nhập tên lookbook..."
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca]"
              />
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Mô tả
              </label>
              <textarea
                value={newLookbook.description}
                onChange={(e) => setNewLookbook({ ...newLookbook, description: e.target.value })}
                placeholder="Nhập mô tả lookbook..."
                rows={4}
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca] resize-none"
              />
            </div>

            {/* Liên kết */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Liên kết
              </label>
              <input
                type="url"
                value={newLookbook.link}
                onChange={(e) => setNewLookbook({ ...newLookbook, link: e.target.value })}
                placeholder="https://..."
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca]"
              />
            </div>

            {/* Thêm ảnh */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Ảnh Lookbook
              </label>
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewLookbook({ ...newLookbook, image: e.target.files?.[0] || null })}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    {newLookbook.image ? newLookbook.image.name : 'Chọn ảnh từ thiết bị'}
                  </span>
                </label>
              </div>
            </div>

            {/* Banner */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Banner
              </label>
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewLookbook({ ...newLookbook, banner: e.target.files?.[0] || null })}
                  className="hidden"
                  id="banner-upload"
                />
                <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    {newLookbook.banner ? newLookbook.banner.name : 'Chọn banner từ thiết bị'}
                  </span>
                </label>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Hình ảnh Gallery (có thể chọn nhiều ảnh)
              </label>
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewLookbook({ ...newLookbook, gallery: Array.from(e.target.files || []) })}
                  className="hidden"
                  id="gallery-upload"
                />
                <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    {newLookbook.gallery.length > 0 
                      ? `${newLookbook.gallery.length} ảnh được chọn` 
                      : 'Chọn ảnh từ thiết bị'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-[12px] px-[30px] py-[20px] border-t border-[#d4d4d4]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-[20px] py-[10px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-[#737373] hover:bg-[#f5f5f5] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateLookbook}
              disabled={!newLookbook.name}
              className="px-[20px] py-[10px] bg-[#9a67ca] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-white hover:bg-[#8856b9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo Lookbook
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Gallery Modal */}
    {showGalleryModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-[20px]">
        <div className="bg-white rounded-[16px] w-full max-w-[800px] max-h-[90vh] overflow-hidden shadow-lg flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-[30px] py-[20px] border-b border-[#d4d4d4]">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-black">
              Hình ảnh Lookbook
            </h2>
            <button 
              onClick={() => setShowGalleryModal(false)}
              className="text-[24px] text-[#737373] hover:text-black transition-colors"
            >
              ×
            </button>
          </div>

          {/* Modal Content - Gallery Images */}
          <div className="flex-1 overflow-y-auto px-[30px] py-[24px]">
            {getGalleryImages().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[16px] text-[#737373]">
                  Chưa có hình ảnh nào trong lookbook này
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[16px]">
                {getGalleryImages().map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={imageUrl} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-[250px] object-cover rounded-[8px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Edit Lookbook Modal */}
    {showEditModal && editLookbook && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[16px] w-[700px] max-h-[90vh] overflow-y-auto shadow-lg">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-[30px] py-[20px] border-b border-[#d4d4d4]">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-black">
              Chỉnh sửa Lookbook
            </h2>
            <button 
              onClick={() => setShowEditModal(false)}
              className="text-[24px] text-[#737373] hover:text-black transition-colors"
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-[30px] py-[24px] flex flex-col gap-[20px]">
            {/* Tên lookbook */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Tên Lookbook
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca]"
              />
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Mô tả
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca] resize-none"
              />
            </div>

            {/* Liên kết */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Liên kết
              </label>
              <input
                type="url"
                value={editData.link}
                onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                placeholder="https://..."
                className="px-[16px] py-[12px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] text-[14px] focus:outline-none focus:border-[#9a67ca]"
              />
              {editData.link && (
                <button
                  onClick={() => setEditData({ ...editData, link: '' })}
                  className="text-[12px] text-[#d9534f] hover:text-[#c9302c] transition-colors text-left"
                >
                  ✕ Xóa liên kết
                </button>
              )}
            </div>

            {/* Ảnh Lookbook */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Ảnh Lookbook
              </label>
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditData({ ...editData, image: e.target.files?.[0] || null })}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label htmlFor="edit-image-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    {editData.image ? editData.image.name : 'Chọn ảnh từ thiết bị'}
                  </span>
                </label>
              </div>
            </div>

            {/* Banner */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Banner
              </label>
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditData({ ...editData, banner: e.target.files?.[0] || null })}
                  className="hidden"
                  id="edit-banner-upload"
                />
                <label htmlFor="edit-banner-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    Chọn banner từ thiết bị
                  </span>
                </label>
              </div>
            </div>

            {/* Gallery Images Management */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1a0330]">
                Quản lý Hình ảnh Gallery ({getEditGalleryImages().length} ảnh)
              </label>
              
              {/* Current Gallery Images */}
              {getEditGalleryImages().length > 0 && (
                <div className="grid grid-cols-3 gap-[12px] mb-[16px]">
                  {getEditGalleryImages().map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Current ${index + 1}`}
                        className="w-full h-[120px] object-cover rounded-[8px]"
                      />
                      <button
                        onClick={() => removeGalleryImage(imageUrl)}
                        className="absolute top-[4px] right-[4px] bg-[#d9534f] text-white rounded-full w-[24px] h-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add More Gallery Images */}
              <div className="border-2 border-dashed border-[#d4d4d4] rounded-[8px] p-[20px] flex flex-col items-center justify-center gap-[12px] hover:border-[#9a67ca] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setEditData({ ...editData, gallery: Array.from(e.target.files || []) })}
                  className="hidden"
                  id="edit-gallery-upload"
                />
                <label htmlFor="edit-gallery-upload" className="cursor-pointer flex flex-col items-center gap-[8px]">
                  <svg className="w-[40px] h-[40px] text-[#9a67ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#737373]">
                    {editData.gallery.length > 0 
                      ? `${editData.gallery.length} ảnh được thêm` 
                      : 'Thêm ảnh mới'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between gap-[12px] px-[30px] py-[20px] border-t border-[#d4d4d4]">
            <button
              onClick={handleDeleteLookbook}
              className="px-[20px] py-[10px] bg-[#d9534f] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-white hover:bg-[#c9302c] transition-colors"
            >
              Xóa Lookbook
            </button>
            <div className="flex gap-[12px]">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-[20px] py-[10px] border border-[#d4d4d4] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-[#737373] hover:bg-[#f5f5f5] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateLookbook}
                className="px-[20px] py-[10px] bg-[#9a67ca] rounded-[8px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-white hover:bg-[#8856b9] transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Lookbook;
