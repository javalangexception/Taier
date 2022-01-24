/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useMemo, useState } from 'react';
import Api from '../../../api/console';
import { findKey } from 'lodash';
import type {
	ICapacityProps,
	IClusterResourceProps,
	IFairProps,
	IFIFOProps,
	INodeProps,
	IQueueProps,
	IResourceMetrics,
} from './helper';
import { NODE_COLUMNS, RenderTable, ResourceCard, RESOURCE_DETAIL_COLUMNS } from './helper';
import type { ColumnsType } from 'antd/lib/table';
import { SCHEDULE_TYPE } from '@/constant';
import './index.scss';

export default ({
	clusterName,
	onGetQueueList,
}: {
	clusterName?: string;
	onGetQueueList?: (queueList: IQueueProps[]) => void;
}) => {
	const [nodeLists, setNodeLists] = useState<INodeProps[]>([]);
	const [resourceMetrics, setMetrics] = useState<IResourceMetrics>({
		coresRate: 0,
		memRate: 0,
		totalCores: 0,
		totalMem: 0,
		usedCores: 0,
		usedMem: 0,
	});
	const [scheduleType, setScheduleType] = useState<SCHEDULE_TYPE>(SCHEDULE_TYPE.Capacity);
	const [queueLists, setQueueLists] = useState<IQueueProps[]>([]);
	const [target, setTarget] = useState<ICapacityProps | undefined>(undefined);

	const getClusterResources = () => {
		Api.getClusterResources({
			clusterName,
		}).then((res) => {
			if (res.code === 1) {
				const data = res.data as IClusterResourceProps;
				if (!data) return;
				setNodeLists(data.nodes || []);
				if (data.resourceMetrics) {
					setMetrics(data.resourceMetrics);
				}
				if (data.scheduleInfo) {
					setScheduleType(data.scheduleInfo.type);
				}

				let queuesListSource = [];
				switch (data.scheduleInfo?.type) {
					case SCHEDULE_TYPE.Capacity: {
						queuesListSource = data.queues || [];
						break;
					}
					case SCHEDULE_TYPE.Fair: {
						const childQueues = data.scheduleInfo?.rootQueue?.childQueues;
						queuesListSource = childQueues?.queue ?? childQueues;
						break;
					}
					case SCHEDULE_TYPE.FIFO: {
						queuesListSource = [{ ...data?.scheduleInfo }];
						break;
					}
					default:
						break;
				}
				onGetQueueList?.(queuesListSource || []);
				setQueueLists(queuesListSource || []);
			}
		});
	};

	const handleShowDetailt = (record: ICapacityProps) => {
		setTarget((current) => {
			if (current?.queueName && current.queueName === record.queueName) {
				return undefined;
			}
			return record;
		});
	};

	useEffect(() => {
		getClusterResources();
	}, []);

	const queueColumns = useMemo(() => {
		switch (scheduleType) {
			case SCHEDULE_TYPE.Capacity:
				return [
					{
						title: '资源队列',
						dataIndex: 'queueName',
					},
					{
						title: '已使用容量',
						dataIndex: 'usedCapacity',
						render(text) {
							return `${text}%`;
						},
					},
					{
						title: '分配容量',
						dataIndex: 'capacity',
						render(text) {
							return `${text}%`;
						},
					},
					{
						title: '最大容量',
						dataIndex: 'maxCapacity',
						render(text) {
							return `${text}%`;
						},
					},
					{
						title: '查看',
						dataIndex: 'action',
						render: (_, record) => {
							return (
								<a
									onClick={() => {
										handleShowDetailt(record);
									}}
								>
									资源详情
								</a>
							);
						},
						width: 150,
					},
				] as ColumnsType<ICapacityProps>;
			case SCHEDULE_TYPE.Fair:
				return [
					{
						title: '资源队列',
						dataIndex: 'queueName',
					},
					{
						title: '已使资源数',
						dataIndex: 'usedResources',
						render(text: IFairProps['usedResources']) {
							return (
								<span>
									memory:
									<span style={{ margin: 5 }}>{text.memory},&nbsp;</span>
									vCores:
									<span style={{ margin: 5 }}>{text.vCores}</span>
								</span>
							);
						},
					},
					{
						title: '最大资源数',
						dataIndex: 'maxResources',
						render(text: IFairProps['maxResources']) {
							return (
								<span>
									memory:
									<span style={{ margin: 5 }}>{text.memory},&nbsp;</span>
									vCores:
									<span style={{ margin: 5 }}>{text.vCores}</span>
								</span>
							);
						},
					},
					{
						title: '最小资源数',
						dataIndex: 'minResources',
						render(text: IFairProps['minResources']) {
							return (
								<span>
									memory:
									<span style={{ margin: 5 }}>{text.memory},&nbsp;</span>
									vCores:
									<span style={{ margin: 5 }}>{text.vCores}</span>
								</span>
							);
						},
					},
				] as ColumnsType<IFairProps>;
			case SCHEDULE_TYPE.FIFO:
				return [
					{
						title: '容量',
						dataIndex: 'capacity',
					},
					{
						title: '已使用容量',
						dataIndex: 'usedCapacity',
					},
					{
						title: '节点数量',
						dataIndex: 'numNodes',
					},
				] as ColumnsType<IFIFOProps>;
			default:
				return [];
		}
	}, [scheduleType]);

	return (
		<>
			<div className="c-resourceView__container">
				<div style={{ height: 110, width: '50%', marginRight: 10 }}>
					<ResourceCard
						type="cpu"
						title="CPU（core）"
						useNum={resourceMetrics.usedCores}
						total={resourceMetrics.totalCores}
						value={resourceMetrics.coresRate}
					/>
				</div>
				<div style={{ height: 110, width: '50%', marginLeft: 10 }}>
					<ResourceCard
						type="memory"
						title="内存（GB）"
						useNum={resourceMetrics.usedMem}
						total={resourceMetrics.totalMem}
						value={resourceMetrics.memRate}
					/>
				</div>
			</div>
			<RenderTable
				columns={NODE_COLUMNS}
				dataSource={nodeLists}
				title="Yarn-NodeManager 资源使用"
				rowKey="nodeName"
			/>
			<RenderTable
				columns={queueColumns}
				dataSource={queueLists}
				rowKey="queueName"
				title={`各资源队列资源使用（调度方式：${findKey(
					SCHEDULE_TYPE,
					(val) => val === scheduleType,
				)}）`}
			/>
			{target ? (
				<RenderTable
					columns={RESOURCE_DETAIL_COLUMNS}
					dataSource={target.users}
					title="资源详情"
					rowKey="username"
					desc={target.queueName}
				/>
			) : null}
		</>
	);
};
