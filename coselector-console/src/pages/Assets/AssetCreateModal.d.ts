import React from 'react';

export interface AssetCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

declare const AssetCreateModal: React.FC<AssetCreateModalProps>;
export default AssetCreateModal;
